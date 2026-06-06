<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Services\OrderFulfillmentService;
use App\Services\RefundService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Stripe\Checkout\Session as StripeSession;
use Stripe\Event;
use Stripe\Stripe;
use Stripe\Webhook;

class StripeWebhookController extends Controller
{
    public function __construct(
        private readonly OrderFulfillmentService $fulfillment,
        private readonly RefundService $refunds,
    ) {
    }

    public function handle(Request $request): JsonResponse
    {
        Stripe::setApiKey(config('services.stripe.secret'));

        try {
            $event = Webhook::constructEvent(
                $request->getContent(),
                $request->header('Stripe-Signature'),
                config('services.stripe.webhook_secret')
            );
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }

        match ($event->type) {
            // Crea l'ordine alla conferma del pagamento, anche se il cliente non
            // torna sul sito (es. abbandono del redirect, frequente con PayPal).
            'checkout.session.completed',
            'checkout.session.async_payment_succeeded' => $this->handleCheckoutCompleted($event),
            'charge.refunded' => $this->handleChargeRefunded($event),
            default => null,
        };

        return response()->json(['received' => true]);
    }

    private function handleCheckoutCompleted(Event $event): void
    {
        $session = $event->data->object;

        if ($session instanceof StripeSession) {
            $this->fulfillment->fulfillFromSession($session);
        }
    }

    private function handleChargeRefunded(Event $event): void
    {
        $charge = $event->data->object;
        $order = Order::where('stripe_payment_intent_id', $charge->payment_intent)->first();

        if (! $order) {
            return;
        }

        // amount_refunded e' cumulativo (in centesimi); refunded e' true solo a rimborso
        // totale. Funziona sia per i rimborsi emessi dal nostro admin sia per quelli
        // fatti direttamente dalla dashboard Stripe; applyRefund e' idempotente.
        $this->refunds->applyRefund(
            $order,
            $charge->amount_refunded / 100,
            (bool) $charge->refunded,
        );
    }
}
