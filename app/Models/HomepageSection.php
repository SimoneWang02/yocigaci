<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class HomepageSection extends Model
{
    protected $fillable = ['title', 'cta_link', 'is_active', 'sort_order'];

    protected $casts = ['is_active' => 'boolean'];

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'homepage_section_product')
            ->withPivot('sort_order')
            ->orderBy('homepage_section_product.sort_order');
    }
}
