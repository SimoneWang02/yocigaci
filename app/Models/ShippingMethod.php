<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ShippingMethod extends Model
{
    protected $fillable = ['name', 'description', 'cost', 'free_threshold', 'is_active', 'sort_order'];

    protected $casts = [
        'cost' => 'decimal:2',
        'free_threshold' => 'decimal:2',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function shippingFor(float $subtotal): float
    {
        if ($this->free_threshold !== null && $subtotal >= (float) $this->free_threshold) {
            return 0.0;
        }

        return (float) $this->cost;
    }
}
