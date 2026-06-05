<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\HomepageSectionRequest;
use App\Http\Resources\HomepageSectionResource;
use App\Models\HomepageSection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class HomepageSectionController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $sections = HomepageSection::orderBy('sort_order')
            ->with(['products' => fn ($q) => $q->with(['primaryImage', 'game', 'category'])])
            ->get();

        return HomepageSectionResource::collection($sections);
    }

    public function store(HomepageSectionRequest $request): HomepageSectionResource
    {
        $section = HomepageSection::create($request->safe()->except('product_ids'));
        $this->syncProducts($section, $request->input('product_ids', []));

        return new HomepageSectionResource($this->loaded($section));
    }

    public function show(HomepageSection $homepageSection): HomepageSectionResource
    {
        return new HomepageSectionResource($this->loaded($homepageSection));
    }

    public function update(HomepageSectionRequest $request, HomepageSection $homepageSection): HomepageSectionResource
    {
        $homepageSection->update($request->safe()->except('product_ids'));

        if ($request->has('product_ids')) {
            $this->syncProducts($homepageSection, $request->input('product_ids', []));
        }

        return new HomepageSectionResource($this->loaded($homepageSection));
    }

    public function destroy(HomepageSection $homepageSection): JsonResponse
    {
        $homepageSection->delete();

        return response()->json(['message' => 'Sezione eliminata.']);
    }

    public function reorder(\Illuminate\Http\Request $request): JsonResponse
    {
        $ids = $request->validate(['ids' => 'required|array', 'ids.*' => 'integer'])['ids'];

        foreach ($ids as $index => $id) {
            HomepageSection::where('id', $id)->update(['sort_order' => $index]);
        }

        return response()->json(['message' => 'Ordine aggiornato.']);
    }

    private function syncProducts(HomepageSection $section, array $productIds): void
    {
        $sync = [];
        foreach (array_values($productIds) as $index => $id) {
            $sync[$id] = ['sort_order' => $index];
        }
        $section->products()->sync($sync);
    }

    private function loaded(HomepageSection $section): HomepageSection
    {
        return $section->fresh(['products' => fn ($q) => $q->with(['primaryImage', 'game', 'category'])]);
    }
}
