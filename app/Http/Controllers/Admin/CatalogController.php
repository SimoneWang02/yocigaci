<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CatalogRequest;
use App\Http\Resources\CatalogResource;
use App\Models\Catalog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CatalogController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $catalogs = Catalog::orderBy('title')
            ->with(['products' => fn ($q) => $q->with(['primaryImage', 'game', 'category'])])
            ->get();

        return CatalogResource::collection($catalogs);
    }

    public function store(CatalogRequest $request): CatalogResource
    {
        $catalog = Catalog::create($request->safe()->except('product_ids'));
        $this->syncProducts($catalog, $request->input('product_ids', []));

        return new CatalogResource($this->loaded($catalog));
    }

    public function show(Catalog $catalog): CatalogResource
    {
        return new CatalogResource($this->loaded($catalog));
    }

    public function update(CatalogRequest $request, Catalog $catalog): CatalogResource
    {
        $catalog->update($request->safe()->except('product_ids'));

        if ($request->has('product_ids')) {
            $this->syncProducts($catalog, $request->input('product_ids', []));
        }

        return new CatalogResource($this->loaded($catalog));
    }

    public function destroy(Catalog $catalog): JsonResponse
    {
        $catalog->delete();

        return response()->json(['message' => 'Catalogo eliminato.']);
    }

    private function syncProducts(Catalog $catalog, array $productIds): void
    {
        $sync = [];
        foreach (array_values($productIds) as $index => $id) {
            $sync[$id] = ['sort_order' => $index];
        }
        $catalog->products()->sync($sync);
    }

    private function loaded(Catalog $catalog): Catalog
    {
        return $catalog->fresh(['products' => fn ($q) => $q->with(['primaryImage', 'game', 'category'])]);
    }
}
