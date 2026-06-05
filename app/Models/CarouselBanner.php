<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class CarouselBanner extends Model
{
    protected $fillable = ['path', 'link', 'sort_order', 'is_active'];

    protected $casts = ['is_active' => 'boolean'];

    protected $appends = ['url'];

    public function getUrlAttribute(): string
    {
        return Storage::disk('public')->url($this->path);
    }
}
