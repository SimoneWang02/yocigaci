<?php

namespace App\Http\Controllers;

use App\Http\Requests\CheckoutRequest;
use App\Mail\OrderConfirmed;
use App\Mail\PreorderConfirmed;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Stripe\Checkout\Session as StripeSession;
use Stripe\Stripe;

class CheckoutController extends Controller
{
    private const SHIPPING_FREE_THRESHOLD = 60.00;
    private const SHIPPING_COST = 5.90;

    public function createSession(CheckoutRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $cartItems = $this->validateCartItems($validated['items']);

        $subtotal = collect($cartItems)->sum(fn ($i) => $i['price'] * $i['quantity']);
        $shipping = $subtotal >= self::SHIPPING_FREE_THRESHOLD ? 0 : self::SHIPPING_COST;

        Stripe::setApiKey(config('services.stripe.secret'));

        $lineItems = collect($cartItems)->map(fn ($item) => [
            'price_data' => [
                'currency' => 'eur',
                'product_data' => array_filter([
                    'name' => $item['name'],
                    'images' => $item['image_url'] ? [$item['image_url']] : [],
                ]),
                'unit_amount' => (int) round($item['price'] * 100),
            ],
            'quantity' => $item['quantity'],
        ])->values()->toArray();

        if ($shipping > 0) {
            $lineItems[] = [
                'price_data' => [
                    'currency' => 'eur',
                    'product_data' => ['name' => 'Spedizione standard'],
                    'unit_amount' => (int) round($shipping * 100),
                ],
                'quantity' => 1,
            ];
        }

        $appUrl = config('app.url');

        $session = StripeSession::create([
            'mode' => 'payment',
            'payment_method_types' => ['card', 'paypal'],
            'line_items' => $lineItems,
            'success_url' => "{$appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}",
            'cancel_url' => "{$appUrl}/checkout",
            'locale' => 'it',
            'metadata' => [
                'items' => json_encode(
                    collect($cartItems)->map(fn ($i) => ['product_id' => $i['id'], 'quantity' => $i['quantity']])->toArray()
                ),
                'shipping_address' => json_encode($validated['shipping_address']),
                'notes' => $validated['notes'] ?? null,
                'user_id' => $request->user()?->id,
            ],
        ]);

        return response()->json(['url' => $session->url]);
    }

    public function confirm(Request $request): JsonResponse
    {
        $request->validate(['session_id' => ['required', 'string']]);

        Stripe::setApiKey(config('services.stripe.secret'));
        $session = StripeSession::retrieve($request->input('session_id'));

        if ($session->payment_status !== 'paid') {
            return response()->json(['message' => 'Pagamento non completato.'], 422);
        }

        // Idempotenza: se l'ordine esiste già restituiamo il numero
        $existing = Order::where('stripe_payment_intent_id', $session->payment_intent)->first();
        if ($existing) {
            return response()->json(['order_number' => $existing->order_number]);
        }

        $rawItems = json_decode($session->metadata->items, true);
        $shippingAddress = json_decode($session->metadata->shipping_address, true);
        $notes = $session->metadata->notes;
        $userId = $session->metadata->user_id ?: null;

        $cartItems = $this->validateCartItems($rawItems);

        $subtotal = collect($cartItems)->sum(fn ($i) => $i['price'] * $i['quantity']);
        $shipping = $subtotal >= self::SHIPPING_FREE_THRESHOLD ? 0 : self::SHIPPING_COST;
        $total = $subtotal + $shipping;
        $hasPreorder = collect($cartItems)->contains(fn ($i) => $i['is_preorder']);

        $order = DB::transaction(function () use ($cartItems, $shippingAddress, $notes, $subtotal, $shipping, $total, $hasPreorder, $session, $userId) {
            $order = Order::create([
                'user_id' => $userId,
                'status' => $hasPreorder ? 'preorder_confirmed' : 'paid',
                'type' => $hasPreorder ? 'preorder' : 'standard',
                'subtotal' => $subtotal,
                'shipping_cost' => $shipping,
                'total' => $total,
                'shipping_address' => $shippingAddress,
                'notes' => $notes,
                'stripe_payment_intent_id' => $session->payment_intent,
                'stripe_payment_status' => 'succeeded',
            ]);

            foreach ($cartItems as $item) {
                $order->items()->create([
                    'product_id' => $item['id'],
                    'product_snapshot' => [
                        'name' => $item['name'],
                        'price' => $item['price'],
                        'image_url' => $item['image_url'] ?? null,
                        'slug' => $item['slug'],
                        'is_preorder' => $item['is_preorder'],
                        'preorder_release_date' => $item['preorder_release_date'] ?? null,
                    ],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['price'],
                    'total_price' => $item['price'] * $item['quantity'],
                ]);

                if (! $item['is_preorder']) {
                    Product::where('id', $item['id'])->decrement('stock', $item['quantity']);
                }
            }

            return $order;
        });

        $email = $shippingAddress['email'] ?? null;
        if (! $email && $userId) {
            $email = \App\Models\User::find($userId)?->email;
        }
        if ($email) {
            $mailable = $order->type === 'preorder'
                ? new PreorderConfirmed($order)
                : new OrderConfirmed($order);
            Mail::to($email)->queue($mailable);
        }

        return response()->json([
            'order_number' => $order->order_number,
            'status' => $order->status,
        ], 201);
    }

    private function validateCartItems(array $rawItems): array
    {
        $productIds = array_column($rawItems, 'product_id');
        $products = Product::whereIn('id', $productIds)->active()->get()->keyBy('id');
        $items = [];

        foreach ($rawItems as $rawItem) {
            $product = $products->get($rawItem['product_id']);

            if (! $product) {
                abort(422, "Prodotto #{$rawItem['product_id']} non disponibile.");
            }

            if (! $product->is_preorder && $product->stock < $rawItem['quantity']) {
                abort(422, "Stock insufficiente per \"{$product->name}\".");
            }

            $items[] = [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'price' => (float) $product->price,
                'quantity' => $rawItem['quantity'],
                'is_preorder' => $product->is_preorder,
                'preorder_release_date' => $product->preorder_release_date?->toDateString(),
                'image_url' => $product->primaryImage?->url,
            ];
        }

        return $items;
    }
}
