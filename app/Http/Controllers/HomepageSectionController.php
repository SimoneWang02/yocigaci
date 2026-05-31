<?php

namespace App\Http\Controllers;

use App\Http\Resources\HomepageSectionResource;
use App\Models\HomepageSection;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class HomepageSectionController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $sections = HomepageSection::where('is_active', true)
            ->orderBy('sort_order')
            ->with(['products' => fn ($q) => $q->where('is_active', true)->with(['primaryImage', 'game', 'category'])])
            ->get()
            ->filter(fn ($section) => $section->products->isNotEmpty())
            ->values();

        return HomepageSectionResource::collection($sections);
    }
}
