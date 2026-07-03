<?php

namespace App\Http\Resources;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'language' => $this->language,
            'slug' => $this->slug,
            'description' => $this->description,
            'price' => (float) $this->price,
            'stock' => $this->stock,
            'is_preorder' => $this->is_preorder,
            'is_limited' => $this->is_limited,
            'preorder_release_date' => $this->preorder_release_date?->toDateString(),
            'preorder_note' => $this->preorder_note,
            'user_already_purchased' => $this->when(
                $this->is_limited,
                fn () => $this->userAlreadyPurchased(auth('sanctum')->id())
            ),
            'is_active' => $this->is_active,
            'sort_order' => $this->sort_order,
            'click_count' => $this->when($this->click_count !== null, fn () => (int) $this->click_count),
            'is_trending' => in_array($this->id, Product::trendingIds(), true),
            'game' => new GameResource($this->whenLoaded('game')),
            'category' => new CategoryResource($this->whenLoaded('category')),
            'primary_image' => new ProductImageResource($this->whenLoaded('primaryImage')),
            'images' => ProductImageResource::collection($this->whenLoaded('images')),
        ];
    }
}
