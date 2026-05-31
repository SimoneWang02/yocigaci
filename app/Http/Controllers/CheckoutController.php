<?php

namespace App\Http\Controllers;

use App\Http\Requests\CheckoutRequest;
use App\Mail\OrderConfirmed;
use App\Mail\PreorderConfirmed;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Stripe\PaymentIntent;
use Stripe\Stripe;

class CheckoutController extends Controller
{
    private const SHIPPING_FREE_THRESHOLD = 60.00;
    private const SHIPPING_COST = 5.90;

    public function createIntent(CheckoutRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $cartItems = $this->validateCartItems($validated['items']);

        $subtotal = collect($cartItems)->sum(fn ($i) => $i['price'] * $i['quantity']);
        $shipping = $subtotal >= self::SHIPPING_FREE_THRESHOLD ? 0 : self::SHIPPING_COST;
        $total = $subtotal + $shipping;

        Stripe::setApiKey(config('services.stripe.secret'));

        $intent = PaymentIntent::create([
            'amount' => (int) round($total * 100),
            'currency' => 'eur',
            'metadata' => [
                'cart' => json_encode($cartItems),
                'shipping_address' => json_encode($validated['shipping_address']),
                'user_id' => $request->user()?->id,
                'notes' => $validated['notes'] ?? null,
            ],
        ]);

        return response()->json([
            'client_secret' => $intent->client_secret,
            'payment_intent_id' => $intent->id,
            'subtotal' => $subtotal,
            'shipping' => $shipping,
            'total' => $total,
        ]);
    }

    public function confirm(CheckoutRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $cartItems = $this->validateCartItems($validated['items']);

        Stripe::setApiKey(config('services.stripe.secret'));
        $intentId = $request->input('payment_intent_id');
        $intent = PaymentIntent::retrieve($intentId);

        if ($intent->status !== 'succeeded') {
            return response()->json(['message' => 'Pagamento non confermato.'], 422);
        }

        $subtotal = collect($cartItems)->sum(fn ($i) => $i['price'] * $i['quantity']);
        $shipping = $subtotal >= self::SHIPPING_FREE_THRESHOLD ? 0 : self::SHIPPING_COST;
        $total = $subtotal + $shipping;
        $hasPreorder = collect($cartItems)->contains(fn ($i) => $i['is_preorder']);

        $order = DB::transaction(function () use ($cartItems, $validated, $subtotal, $shipping, $total, $hasPreorder, $intent, $request) {
            $user = $request->user();
            if ($user && ! $user->name && ! empty($validated['shipping_address']['full_name'])) {
                $user->update(['name' => $validated['shipping_address']['full_name']]);
            }

            $order = Order::create([
                'user_id' => $request->user()?->id,
                'status' => $hasPreorder ? 'preorder_confirmed' : 'paid',
                'type' => $hasPreorder ? 'preorder' : 'standard',
                'subtotal' => $subtotal,
                'shipping_cost' => $shipping,
                'total' => $total,
                'shipping_address' => $validated['shipping_address'],
                'notes' => $validated['notes'] ?? null,
                'stripe_payment_intent_id' => $intent->id,
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

        $email = $request->user()?->email ?? $validated['shipping_address']['email'] ?? null;
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
