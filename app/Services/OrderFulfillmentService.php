<?php

namespace App\Services;

use App\Mail\OrderConfirmed;
use App\Mail\PreorderConfirmed;
use App\Models\Order;
use App\Models\Product;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Stripe\Checkout\Session as StripeSession;

class OrderFulfillmentService
{
    // Valori di default usati quando l'admin non ha ancora configurato la spedizione.
    public const DEFAULT_SHIPPING_COST = 15.90;
    public const DEFAULT_SHIPPING_FREE_THRESHOLD = 250.00;

    /**
     * Costo di spedizione configurato dall'admin (Setting), con fallback al default.
     */
    public static function shippingCost(): float
    {
        return (float) Setting::getValue('shipping_cost', self::DEFAULT_SHIPPING_COST);
    }

    /**
     * Soglia di subtotale oltre la quale la spedizione e' gratuita.
     */
    public static function shippingFreeThreshold(): float
    {
        return (float) Setting::getValue('shipping_free_threshold', self::DEFAULT_SHIPPING_FREE_THRESHOLD);
    }

    /**
     * Calcola la spedizione per un dato subtotale: gratuita sopra la soglia.
     */
    public static function shippingFor(float $subtotal): float
    {
        return $subtotal >= self::shippingFreeThreshold() ? 0.0 : self::shippingCost();
    }

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

        if (! $paymentIntentId) {
            return null;
        }

        if ($existing = Order::where('stripe_payment_intent_id', $paymentIntentId)->first()) {
            return $existing;
        }

        // La sessione potrebbe non provenire dal nostro flusso (altra integrazione,
        // evento di test): senza i metadati del carrello non possiamo creare l'ordine.
        $rawItems = json_decode($session->metadata->items ?? '[]', true);
        if (! is_array($rawItems) || $rawItems === []) {
            Log::warning('Checkout session senza metadati items, ordine non creato.', [
                'session_id' => $session->id,
                'payment_intent' => $paymentIntentId,
            ]);

            return null;
        }

        $shippingAddress = json_decode($session->metadata->shipping_address ?? 'null', true);
        $notes = $session->metadata->notes ?? null;
        $userId = ($session->metadata->user_id ?? null) ?: null;
        $deliveryMethod = $session->metadata->delivery_method ?? 'shipping';

        // Stripe raccoglie sempre l'email nella sua pagina di pagamento: la recuperiamo
        // qui per conservarla sull'ordine e poter inviare la conferma anche agli ospiti.
        $stripeEmail = $session->customer_details->email ?? $session->customer_email ?? null;
        if ($stripeEmail && is_array($shippingAddress) && empty($shippingAddress['email'])) {
            $shippingAddress['email'] = $stripeEmail;
        }

        // A differenza di validateCartItems() (pre-pagamento), qui il cliente ha gia'
        // pagato: prodotti disattivati o stock insufficiente NON devono mai bloccare
        // la creazione dell'ordine. Eventuali scoperti restano visibili come stock negativo.
        $cartItems = $this->resolveItemsForFulfillment($rawItems);

        $subtotal = collect($cartItems)->sum(fn ($i) => $i['price'] * $i['quantity']);
        // Il ritiro in negozio non ha costi di spedizione.
        $shipping = $deliveryMethod === 'pickup' ? 0.0 : self::shippingFor($subtotal);
        $total = $subtotal + $shipping;
        $hasPreorder = collect($cartItems)->contains(fn ($i) => $i['is_preorder']);

        try {
            $order = DB::transaction(function () use ($cartItems, $shippingAddress, $deliveryMethod, $notes, $subtotal, $shipping, $total, $hasPreorder, $paymentIntentId, $userId) {
                $order = Order::create([
                    'user_id' => $userId,
                    'status' => $hasPreorder ? 'preorder_confirmed' : 'paid',
                    'type' => $hasPreorder ? 'preorder' : 'standard',
                    'delivery_method' => $deliveryMethod,
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

            $items[] = $this->mapProduct($product, $rawItem['quantity']);
        }

        return $items;
    }

    /**
     * Risolve gli articoli per la fase di fulfillment (post-pagamento).
     *
     * Non chiama mai abort(): il cliente ha gia' pagato. I prodotti disattivati
     * vengono comunque risolti (niente scope active()); per i prodotti eliminati
     * si crea una riga minima dai metadati cosi' l'ordine resta tracciabile.
     *
     * @param  array<int, array{product_id: int, quantity: int}>  $rawItems
     * @return array<int, array<string, mixed>>
     */
    private function resolveItemsForFulfillment(array $rawItems): array
    {
        $productIds = array_column($rawItems, 'product_id');
        $products = Product::whereIn('id', $productIds)->get()->keyBy('id');
        $items = [];

        foreach ($rawItems as $rawItem) {
            $product = $products->get($rawItem['product_id']);

            if (! $product) {
                Log::warning('Prodotto non trovato durante il fulfillment di un ordine pagato.', [
                    'product_id' => $rawItem['product_id'],
                ]);

                $items[] = [
                    'id' => $rawItem['product_id'],
                    'name' => "Prodotto #{$rawItem['product_id']}",
                    'slug' => null,
                    'price' => 0.0,
                    'quantity' => $rawItem['quantity'],
                    'is_preorder' => false,
                    'preorder_release_date' => null,
                    'image_url' => null,
                ];

                continue;
            }

            $items[] = $this->mapProduct($product, $rawItem['quantity']);
        }

        return $items;
    }

    /**
     * @return array<string, mixed>
     */
    private function mapProduct(Product $product, int $quantity): array
    {
        return [
            'id' => $product->id,
            'name' => $product->name,
            'slug' => $product->slug,
            'price' => (float) $product->price,
            'quantity' => $quantity,
            'is_preorder' => $product->is_preorder,
            'preorder_release_date' => $product->preorder_release_date?->toDateString(),
            'image_url' => $product->primaryImage?->url,
        ];
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
