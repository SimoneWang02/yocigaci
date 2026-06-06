<?php

namespace App\Http\Controllers;

use App\Http\Requests\CheckoutRequest;
use App\Services\OrderFulfillmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Stripe\Checkout\Session as StripeSession;
use Stripe\Stripe;

class CheckoutController extends Controller
{
    public function __construct(private readonly OrderFulfillmentService $fulfillment)
    {
    }

    public function createSession(CheckoutRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $cartItems = $this->fulfillment->validateCartItems($validated['items']);

        // La rotta e' pubblica (checkout consentito anche agli ospiti): senza il middleware
        // auth:sanctum il token Bearer non viene interpretato, quindi risolviamo l'utente
        // esplicitamente dal guard sanctum per collegare ordine ed email se e' loggato.
        $user = $request->user('sanctum');

        $deliveryMethod = $validated['delivery_method'];

        $subtotal = collect($cartItems)->sum(fn ($i) => $i['price'] * $i['quantity']);
        // Il ritiro in negozio non ha costi di spedizione.
        $shipping = $deliveryMethod === 'pickup' ? 0.0 : OrderFulfillmentService::shippingFor($subtotal);

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
                'notes' => $validated['notes'] ?? null,
                'user_id' => $user?->id,
            ],
        ];

        if ($email = $user?->email) {
            $sessionParams['customer_email'] = $email;
        }

        $session = StripeSession::create($sessionParams);

        return response()->json(['url' => $session->url]);
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
