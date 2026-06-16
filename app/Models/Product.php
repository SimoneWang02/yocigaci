<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use App\Models\OrderItem;

class Product extends Model
{
    protected $fillable = [
        'game_id', 'category_id', 'language', 'name', 'slug', 'description',
        'price', 'stock', 'is_preorder', 'is_limited', 'preorder_release_date',
        'preorder_note', 'is_active', 'sort_order',
    ];

    protected $casts = [
        'is_preorder' => 'boolean',
        'is_limited' => 'boolean',
        'is_active' => 'boolean',
        'preorder_release_date' => 'date',
        'price' => 'decimal:2',
    ];

    public function game(): BelongsTo
    {
        return $this->belongsTo(Game::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order');
    }

    public function primaryImage(): HasOne
    {
        return $this->hasOne(ProductImage::class)->orderBy('sort_order');
    }

    public function scopeActive(Builder $q): Builder
    {
        return $q->where('is_active', true);
    }

    public function scopeInStock(Builder $q): Builder
    {
        return $q->where('stock', '>', 0);
    }

    public function scopePreorders(Builder $q): Builder
    {
        return $q->where('is_preorder', true);
    }

    public function scopeByGame(Builder $q, string $gameSlug): Builder
    {
        return $q->whereHas('game', fn ($g) => $g->where('slug', $gameSlug));
    }

    public function scopeByCategory(Builder $q, string $categorySlug): Builder
    {
        return $q->whereHas('category', fn ($c) => $c->where('slug', $categorySlug));
    }

    public function userAlreadyPurchased(?int $userId): bool
    {
        if (! $userId) {
            return false;
        }

        return OrderItem::where('product_id', $this->id)
            ->whereHas('order', fn ($q) => $q
                ->where('user_id', $userId)
                ->where('status', '!=', 'refunded')
            )
            ->exists();
    }
}
