<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use App\Models\OrderItem;
use Illuminate\Support\Facades\Cache;

class Product extends Model
{
    private static ?array $trendingIdsCache = null;
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

    public function clicks(): HasMany
    {
        return $this->hasMany(ProductClick::class);
    }

    /**
     * ID dei 10 prodotti più visualizzati negli ultimi 7 giorni, per il badge "in tendenza".
     * Cache di 5 minuti: evita di ricalcolare l'aggregazione ad ogni richiesta.
     */
    public static function trendingIds(): array
    {
        return self::$trendingIdsCache ??= Cache::remember('trending_product_ids', 300, function () {
            return ProductClick::join('products', 'products.id', '=', 'product_clicks.product_id')
                ->where('products.is_active', true)
                ->where('product_clicks.created_at', '>=', now()->subDays(7))
                ->selectRaw('product_clicks.product_id, count(*) as clicks')
                ->groupBy('product_clicks.product_id')
                ->orderByDesc('clicks')
                ->limit(10)
                ->pluck('product_clicks.product_id')
                ->all();
        });
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
