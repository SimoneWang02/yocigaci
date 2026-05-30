<?php

namespace App\Http\Controllers;

use App\Http\Resources\GameResource;
use App\Http\Resources\ProductResource;
use App\Models\Game;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProductController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Product::active()->with(['primaryImage', 'game', 'category']);

        if ($request->game) {
            $query->byGame($request->game);
        }
        if ($request->category) {
            $query->byCategory($request->category);
        }
        if ($request->preorder) {
            $query->preorders();
        }
        if ($request->search) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $sort = $request->sort ?? 'sort_order';
        $direction = str_ends_with($sort, '_desc') ? 'desc' : 'asc';
        $column = match ($sort) {
            'price_asc', 'price_desc' => 'price',
            'newest' => 'created_at',
            default => 'sort_order',
        };

        $query->orderBy($column, $direction);

        return ProductResource::collection($query->paginate(24));
    }

    public function show(string $slug): ProductResource
    {
        $product = Product::active()
            ->where('slug', $slug)
            ->with(['images', 'game', 'category'])
            ->firstOrFail();

        return new ProductResource($product);
    }

    public function games(Request $request): AnonymousResourceCollection
    {
        $query = Game::where('is_active', true)->orderBy('sort_order');

        if ($request->has('with') && $request->with === 'categories') {
            $query->with(['categories' => fn ($q) => $q->where('is_active', true)->orderBy('sort_order')]);
        }

        return GameResource::collection($query->get());
    }
}
