<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Game extends Model
{
    protected $fillable = ['name', 'slug', 'navbar_columns', 'is_active', 'sort_order'];

    protected $casts = ['is_active' => 'boolean'];

    public function categories(): HasMany
    {
        return $this->hasMany(Category::class)->orderBy('nav_column')->orderBy('sort_order');
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }
}
