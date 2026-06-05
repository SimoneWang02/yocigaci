<?php

namespace App\Http\Controllers;

use App\Models\CarouselBanner;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;

class CarouselBannerController extends Controller
{
    public function index(): JsonResponse
    {
        $enabled = Setting::getValue('carousel_enabled', '1') === '1';

        $banners = $enabled
            ? CarouselBanner::where('is_active', true)->orderBy('sort_order')->get()
            : collect();

        return response()->json([
            'data' => $banners,
            'carousel_enabled' => $enabled,
        ]);
    }
}
