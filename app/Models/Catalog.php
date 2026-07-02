<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Catalog extends Model
{
    protected $fillable = ['title', 'is_active'];

    protected $casts = ['is_active' => 'boolean'];

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'catalog_product')
            ->withPivot('sort_order')
            ->orderBy('catalog_product.sort_order');
    }
}
