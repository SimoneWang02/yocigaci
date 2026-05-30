<?php

namespace App\Http\Controllers;

use App\Mail\OrderShipped;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Stripe\Event;
use Stripe\Stripe;
use Stripe\Webhook;

class StripeWebhookController extends Controller
{
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
            'payment_intent.succeeded' => $this->handlePaymentSucceeded($event),
            'payment_intent.payment_failed' => $this->handlePaymentFailed($event),
            'charge.refunded' => $this->handleChargeRefunded($event),
            default => null,
        };

        return response()->json(['received' => true]);
    }

    private function handlePaymentSucceeded(Event $event): void
    {
        $intent = $event->data->object;
        $order = Order::where('stripe_payment_intent_id', $intent->id)->first();

        if (! $order) {
            return;
        }

        if ($order->type === 'standard' && $order->status === 'pending') {
            $order->update([
                'status' => 'paid',
                'stripe_payment_status' => 'succeeded',
            ]);

            // Decrement stock for standard orders confirmed via webhook
            foreach ($order->items as $item) {
                if (! ($item->product_snapshot['is_preorder'] ?? false)) {
                    Product::where('id', $item->product_id)->decrement('stock', $item->quantity);
                }
            }
        }
    }

    private function handlePaymentFailed(Event $event): void
    {
        $intent = $event->data->object;
        $order = Order::where('stripe_payment_intent_id', $intent->id)->first();

        $order?->update([
            'status' => 'pending',
            'stripe_payment_status' => 'failed',
        ]);
    }

    private function handleChargeRefunded(Event $event): void
    {
        $charge = $event->data->object;
        $intentId = $charge->payment_intent;
        $order = Order::where('stripe_payment_intent_id', $intentId)->first();

        $order?->update(['status' => 'refunded']);
    }
}
