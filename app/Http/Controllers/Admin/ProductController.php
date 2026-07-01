<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ProductRequest;
use App\Http\Resources\ProductImageResource;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Product::with(['primaryImage', 'game', 'category']);

        if ($request->game_id) {
            $query->where('game_id', $request->game_id);
        }
        if ($request->category_id) {
            $query->where('category_id', $request->category_id);
        }
        if ($request->language) {
            $query->where('language', $request->language);
        }
        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }
        if ($request->search) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $sortDir = $request->sort_dir === 'desc' ? 'desc' : 'asc';
        $sortBy  = $request->sort_by;

        if ($sortBy === 'game.name') {
            $query->leftJoin('games', 'products.game_id', '=', 'games.id')
                ->orderBy('games.name', $sortDir)
                ->select('products.*');
        } elseif (in_array($sortBy, ['name', 'price', 'stock', 'is_active'])) {
            $query->orderBy($sortBy, $sortDir);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        return ProductResource::collection($query->paginate(50));
    }

    private function uniqueSlug(string $name, ?int $excludeId = null): string
    {
        $base = Str::slug($name);
        $slug = $base;
        $i = 2;
        while (Product::where('slug', $slug)->when($excludeId, fn($q) => $q->where('id', '!=', $excludeId))->exists()) {
            $slug = $base . '-' . $i++;
        }
        return $slug;
    }

    public function store(ProductRequest $request): ProductResource
    {
        $data = $request->validated();
        $data['slug'] = $this->uniqueSlug($data['name']);
        return new ProductResource(Product::create($data));
    }

    public function show(Product $product): ProductResource
    {
        return new ProductResource($product->load(['images', 'game', 'category']));
    }

    public function update(ProductRequest $request, Product $product): ProductResource
    {
        $product->update($request->validated());

        return new ProductResource($product->load(['images', 'game', 'category']));
    }

    public function decrementStock(Product $product): JsonResponse
    {
        if ($product->stock <= 0) {
            return response()->json(['message' => 'Impossibile decrementare lo stock.'], 422);
        }

        $product->decrement('stock');

        return response()->json(['stock' => $product->stock]);
    }

    public function incrementStock(Product $product): JsonResponse
    {
        $product->increment('stock');

        return response()->json(['stock' => $product->stock]);
    }

    public function destroy(Product $product): JsonResponse
    {
        foreach ($product->images as $image) {
            Storage::disk('public')->delete($image->path);
        }
        $product->delete();

        return response()->json(['message' => 'Prodotto eliminato.']);
    }

    public function uploadImage(Request $request, Product $product): ProductImageResource
    {
        $request->validate(['image' => ['required', 'image', 'max:5120']]);

        $lastOrder = $product->images()->max('sort_order') ?? -1;
        $path = $request->file('image')->store('products', 'public');

        $image = $product->images()->create([
            'path' => $path,
            'sort_order' => $lastOrder + 1,
        ]);

        return new ProductImageResource($image);
    }

    public function reorderImages(Request $request, Product $product): JsonResponse
    {
        $request->validate(['order' => ['required', 'array']]);

        foreach ($request->order as $index => $imageId) {
            $product->images()->where('id', $imageId)->update(['sort_order' => $index]);
        }

        return response()->json(['message' => 'Ordine aggiornato.']);
    }

    public function deleteImage(Request $request, Product $product, int $imageId): JsonResponse
    {
        $image = $product->images()->findOrFail($imageId);
        Storage::disk('public')->delete($image->path);
        $image->delete();

        return response()->json(['message' => 'Immagine eliminata.']);
    }
}
