<?php

namespace App\Http\Controllers;

use App\Http\Requests\CheckoutRequest;
use App\Models\Coupon;
use App\Models\ShippingMethod;
use App\Services\OrderFulfillmentService;
use App\Services\StockReservationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Stripe\Checkout\Session as StripeSession;
use Stripe\Coupon as StripeCoupon;
use Stripe\Stripe;

class CheckoutController extends Controller
{
    public function __construct(
        private readonly OrderFulfillmentService $fulfillment,
        private readonly StockReservationService $reservations,
    ) {
    }

    public function createSession(CheckoutRequest $request): JsonResponse
    {
        $validated = $request->validated();

        // La rotta e' pubblica (checkout consentito anche agli ospiti): senza il middleware
        // auth:sanctum il token Bearer non viene interpretato, quindi risolviamo l'utente
        // esplicitamente dal guard sanctum per collegare ordine ed email se e' loggato.
        $user = $request->user('sanctum');

        Stripe::setApiKey(config('services.stripe.secret'));

        // Il cliente e' tornato indietro da Stripe e riprova: libera la vecchia
        // prenotazione prima di validare, altrimenti gli conterebbe contro lo stock.
        if ($previousSessionId = $validated['previous_session_id'] ?? null) {
            try {
                $this->reservations->cancelSession($previousSessionId);
            } catch (\Throwable $e) {
                // Non blocca il nuovo checkout: la prenotazione scade comunque da sola.
                Log::warning('Annullamento sessione checkout precedente fallito.', [
                    'session_id' => $previousSessionId,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        $cartItems = $this->fulfillment->validateCartItems($validated['items'], $user);

        $deliveryMethod = $validated['delivery_method'];

        $subtotal = collect($cartItems)->sum(fn ($i) => $i['price'] * $i['quantity']);

        $shippingMethod = null;
        if ($deliveryMethod !== 'pickup') {
            $shippingMethod = ShippingMethod::find($validated['shipping_method_id']);
            if (! $shippingMethod || ! $shippingMethod->is_active) {
                return response()->json(['message' => 'Metodo di spedizione non disponibile.'], 422);
            }
        }

        $shipping = $deliveryMethod === 'pickup' ? 0.0 : $shippingMethod->shippingFor($subtotal);

        // Coupon validation
        $couponCode = $validated['coupon_code'] ?? null;
        $discountAmount = 0.0;
        if ($couponCode) {
            $coupon = Coupon::where('code', strtoupper($couponCode))->first();
            if (! $coupon || ! $coupon->isValid()) {
                return response()->json(['message' => 'Coupon non valido o scaduto.'], 422);
            }
            $discountAmount = $coupon->calculateDiscount($subtotal);
        }

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
                    'product_data' => ['name' => $shippingMethod?->name ?? 'Spedizione'],
                    'unit_amount' => (int) round($shipping * 100),
                ],
                'quantity' => 1,
            ];
        }

        $appUrl = config('app.url');

        $sessionParams = [
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
                'delivery_method' => $deliveryMethod,
                'shipping_method_id' => $shippingMethod?->id,
                'shipping_method_name' => $shippingMethod?->name,
                'notes' => $validated['notes'] ?? null,
                'user_id' => $user?->id,
                'coupon_code' => $couponCode,
                'discount_amount' => $discountAmount > 0 ? (string) $discountAmount : null,
            ],
        ];

        if ($email = $user?->email) {
            $sessionParams['customer_email'] = $email;
        }

        // Lo stock viene scalato ora e trattenuto finche' la sessione non viene pagata
        // o scade (webhook checkout.session.expired / comando stock:release-expired).
        $reservation = $this->reservations->reserve($cartItems);
        $sessionParams['metadata']['reservation_id'] = (string) $reservation->id;
        $sessionParams['expires_at'] = $reservation->expires_at->timestamp;

        try {
            if ($discountAmount > 0) {
                $stripeCoupon = StripeCoupon::create([
                    'amount_off' => (int) round($discountAmount * 100),
                    'currency'   => 'eur',
                    'duration'   => 'once',
                    'name'       => 'Coupon: ' . strtoupper($couponCode),
                ]);
                $sessionParams['discounts'] = [['coupon' => $stripeCoupon->id]];
            }

            $session = StripeSession::create($sessionParams);
        } catch (\Throwable $e) {
            $this->reservations->release($reservation);

            throw $e;
        }

        $reservation->update(['stripe_session_id' => $session->id]);

        return response()->json(['url' => $session->url, 'session_id' => $session->id]);
    }

    public function confirm(Request $request): JsonResponse
    {
        $request->validate(['session_id' => ['required', 'string']]);

        Stripe::setApiKey(config('services.stripe.secret'));
        $session = StripeSession::retrieve($request->input('session_id'));

        $order = $this->fulfillment->fulfillFromSession($session);

        if (! $order) {
            return response()->json(['message' => 'Pagamento non completato.'], 422);
        }

        return response()->json([
            'order_number' => $order->order_number,
            'status' => $order->status,
        ]);
    }
}
