<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class CarouselBanner extends Model
{
    protected $fillable = ['path', 'link', 'catalog_id', 'sort_order', 'is_active'];

    protected $casts = ['is_active' => 'boolean'];

    protected $appends = ['url'];

    public function getUrlAttribute(): string
    {
        return Storage::disk('public')->url($this->path);
    }

    public function catalog(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Catalog::class);
    }
}
