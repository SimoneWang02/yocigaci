<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CatalogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'is_active' => $this->is_active,
            'products' => ProductResource::collection($this->whenLoaded('products')),
            'product_ids' => $this->whenLoaded('products', fn () => $this->products->pluck('id')),
        ];
    }
}
