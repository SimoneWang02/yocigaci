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

        $sectionId = $request->integer('section_id') ?: null;

        if ($sectionId) {
            $query->join('homepage_section_product as hsp', 'hsp.product_id', '=', 'products.id')
                ->where('hsp.homepage_section_id', $sectionId)
                ->select('products.*');
        }
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
            default => $sectionId ? 'hsp.sort_order' : 'sort_order',
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

    public function suggestions(Request $request): JsonResponse
    {
        $q = trim($request->get('q', ''));

        if (mb_strlen($q) < 2) {
            return response()->json(['data' => []]);
        }

        $products = Product::active()
            ->where('name', 'like', '%' . $q . '%')
            ->with('primaryImage')
            ->orderBy('sort_order')
            ->limit(6)
            ->get();

        return response()->json([
            'data' => $products->map(fn ($p) => [
                'name'         => $p->name,
                'slug'         => $p->slug,
                'price'        => $p->price,
                'is_preorder'  => $p->is_preorder,
                'primary_image'=> $p->primaryImage?->url,
            ]),
        ]);
    }

    public function related(string $slug): AnonymousResourceCollection
    {
        $product = Product::active()->where('slug', $slug)->firstOrFail();

        $related = Product::active()
            ->with(['primaryImage', 'game', 'category'])
            ->where('id', '!=', $product->id)
            ->where('game_id', $product->game_id)
            // Prima i prodotti della stessa categoria, poi gli altri dello stesso gioco
            ->orderByRaw('category_id = ? desc', [$product->category_id])
            ->orderBy('sort_order')
            ->limit(4)
            ->get();

        return ProductResource::collection($related);
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
