<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_number' => $this->order_number,
            'status' => $this->status,
            'type' => $this->type,
            'delivery_method' => $this->delivery_method,
            'subtotal' => (float) $this->subtotal,
            'shipping_cost' => (float) $this->shipping_cost,
            'discount_amount' => (float) $this->discount_amount,
            'coupon_code' => $this->coupon_code,
            'total' => (float) $this->total,
            'shipping_address' => $this->shipping_address,
            'notes' => $this->notes,
            'stripe_payment_status' => $this->stripe_payment_status,
            'shipped_at' => $this->shipped_at?->toIso8601String(),
            'picked_up_at' => $this->picked_up_at?->toIso8601String(),
            'tracking_code' => $this->tracking_code,
            'refunded_amount' => (float) $this->refunded_amount,
            'refunded_at' => $this->refunded_at?->toIso8601String(),
            'refundable_amount' => $this->refundableAmount(),
            // L'ordine e' rimborsabile se ha un pagamento Stripe riuscito e c'e' ancora residuo.
            'is_refundable' => $this->stripe_payment_status === 'succeeded'
                && (bool) $this->stripe_payment_intent_id
                && $this->refundableAmount() > 0,
            'created_at' => $this->created_at->toIso8601String(),
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
            'user' => $this->whenLoaded('user', fn () => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
            ]),
        ];
    }
}
