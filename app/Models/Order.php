<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    protected $fillable = [
        'order_number', 'user_id', 'status', 'type',
        'subtotal', 'shipping_cost', 'total',
        'shipping_address', 'notes',
        'stripe_payment_intent_id', 'stripe_payment_status',
        'shipped_at', 'tracking_code',
    ];

    protected $casts = [
        'shipping_address' => 'array',
        'subtotal' => 'decimal:2',
        'shipping_cost' => 'decimal:2',
        'total' => 'decimal:2',
        'shipped_at' => 'datetime',
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
}
