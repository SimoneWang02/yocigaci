<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HomepageSectionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'cta_link' => $this->cta_link,
            'is_active' => $this->is_active,
            'sort_order' => $this->sort_order,
            'products' => ProductResource::collection($this->whenLoaded('products')),
            'product_ids' => $this->whenLoaded('products', fn () => $this->products->pluck('id')),
        ];
    }
}
