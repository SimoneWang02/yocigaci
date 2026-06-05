<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CarouselBanner;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CarouselBannerController extends Controller
{
    public function index(): JsonResponse
    {
        $banners = CarouselBanner::orderBy('sort_order')->get();

        return response()->json(['data' => $banners]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate(['image' => ['required', 'image', 'max:5120']]);

        $lastOrder = CarouselBanner::max('sort_order') ?? -1;
        $path = $request->file('image')->store('banners', 'public');

        $banner = CarouselBanner::create([
            'path' => $path,
            'link' => $request->input('link'),
            'sort_order' => $lastOrder + 1,
            'is_active' => true,
        ]);

        return response()->json(['data' => $banner], 201);
    }

    public function update(Request $request, CarouselBanner $carouselBanner): JsonResponse
    {
        $data = $request->validate([
            'is_active' => 'sometimes|boolean',
            'link' => 'sometimes|nullable|string|max:500',
        ]);

        $carouselBanner->update($data);

        return response()->json(['data' => $carouselBanner]);
    }

    public function destroy(CarouselBanner $carouselBanner): JsonResponse
    {
        Storage::disk('public')->delete($carouselBanner->path);
        $carouselBanner->delete();

        return response()->json(['message' => 'Banner eliminato.']);
    }

    public function reorder(Request $request): JsonResponse
    {
        $ids = $request->validate(['ids' => 'required|array', 'ids.*' => 'integer'])['ids'];

        foreach ($ids as $index => $id) {
            CarouselBanner::where('id', $id)->update(['sort_order' => $index]);
        }

        return response()->json(['message' => 'Ordine aggiornato.']);
    }
}
