<?php

namespace App\Services;

use App\Mail\OrderConfirmed;
use App\Mail\PreorderConfirmed;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Stripe\Checkout\Session as StripeSession;

class OrderFulfillmentService
{
    public const SHIPPING_FREE_THRESHOLD = 60.00;
    public const SHIPPING_COST = 5.90;

    /**
     * Crea l'ordine a partire da una sessione Stripe Checkout pagata.
     *
     * Idempotente e a prova di concorrenza: puo' essere chiamato sia dal webhook
     * (checkout.session.completed) sia dalla pagina di conferma senza creare duplicati.
     * Restituisce null se la sessione non risulta pagata.
     */
    public function fulfillFromSession(StripeSession $session): ?Order
    {
        if ($session->payment_status !== 'paid') {
            return null;
        }

        $paymentIntentId = $session->payment_intent;

        if ($existing = Order::where('stripe_payment_intent_id', $paymentIntentId)->first()) {
            return $existing;
        }

        $shippingAddress = json_decode($session->metadata->shipping_address, true);
        $notes = $session->metadata->notes ?? null;
        $userId = ($session->metadata->user_id ?? null) ?: null;

        $cartItems = $this->validateCartItems(json_decode($session->metadata->items, true));

        $subtotal = collect($cartItems)->sum(fn ($i) => $i['price'] * $i['quantity']);
        $shipping = $subtotal >= self::SHIPPING_FREE_THRESHOLD ? 0 : self::SHIPPING_COST;
        $total = $subtotal + $shipping;
        $hasPreorder = collect($cartItems)->contains(fn ($i) => $i['is_preorder']);

        try {
            $order = DB::transaction(function () use ($cartItems, $shippingAddress, $notes, $subtotal, $shipping, $total, $hasPreorder, $paymentIntentId, $userId) {
                $order = Order::create([
                    'user_id' => $userId,
                    'status' => $hasPreorder ? 'preorder_confirmed' : 'paid',
                    'type' => $hasPreorder ? 'preorder' : 'standard',
                    'subtotal' => $subtotal,
                    'shipping_cost' => $shipping,
                    'total' => $total,
                    'shipping_address' => $shippingAddress,
                    'notes' => $notes,
                    'stripe_payment_intent_id' => $paymentIntentId,
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
        } catch (QueryException $e) {
            // Race condition: webhook e pagina di conferma in parallelo. L'indice unico su
            // stripe_payment_intent_id ha bloccato il duplicato: restituiamo l'ordine gia' creato.
            if ($existing = Order::where('stripe_payment_intent_id', $paymentIntentId)->first()) {
                return $existing;
            }

            throw $e;
        }

        $this->sendConfirmationEmail($order, $shippingAddress, $userId);

        return $order;
    }

    /**
     * Valida gli articoli del carrello contro il catalogo (disponibilita' e stock).
     *
     * @param  array<int, array{product_id: int, quantity: int}>  $rawItems
     * @return array<int, array<string, mixed>>
     */
    public function validateCartItems(array $rawItems): array
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

    private function sendConfirmationEmail(Order $order, ?array $shippingAddress, ?int $userId): void
    {
        $email = $shippingAddress['email'] ?? null;
        if (! $email && $userId) {
            $email = User::find($userId)?->email;
        }

        if (! $email) {
            return;
        }

        $mailable = $order->type === 'preorder'
            ? new PreorderConfirmed($order)
            : new OrderConfirmed($order);

        Mail::to($email)->queue($mailable);
    }
}
