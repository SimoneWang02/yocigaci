<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    protected $fillable = [
        'order_number', 'user_id', 'status', 'type', 'delivery_method',
        'subtotal', 'shipping_cost', 'discount_amount', 'total',
        'shipping_address', 'notes', 'coupon_code',
        'stripe_payment_intent_id', 'stripe_payment_status',
        'shipped_at', 'picked_up_at', 'tracking_code',
        'refunded_amount', 'refunded_at', 'refund_reason',
    ];

    protected $casts = [
        'shipping_address' => 'array',
        'subtotal' => 'decimal:2',
        'shipping_cost' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'total' => 'decimal:2',
        'shipped_at' => 'datetime',
        'picked_up_at' => 'datetime',
        'refunded_amount' => 'decimal:2',
        'refunded_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(function (Order $order) {
            $year = date('Y');
            $count = Order::whereYear('created_at', $year)->count() + 1;
            $order->order_number = 'ORD-' . $year . '-' . str_pad($count, 4, '0', STR_PAD_LEFT);
        });
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Email a cui inviare le comunicazioni sull'ordine.
     *
     * Usa l'email salvata sull'indirizzo di spedizione (presente anche per gli
     * ordini ospite) e ricade sull'account collegato quando disponibile.
     */
    public function recipientEmail(): ?string
    {
        return $this->shipping_address['email'] ?? $this->user?->email;
    }

    /**
     * Importo ancora rimborsabile su questo ordine (totale meno gia' rimborsato).
     */
    public function refundableAmount(): float
    {
        return round((float) $this->total - (float) $this->refunded_amount, 2);
    }
}
