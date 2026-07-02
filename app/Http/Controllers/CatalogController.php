<?php

namespace App\Http\Controllers;

use App\Models\Catalog;
use Illuminate\Http\JsonResponse;

class CatalogController extends Controller
{
    public function show(Catalog $catalog): JsonResponse
    {
        abort_unless($catalog->is_active, 404);

        return response()->json(['data' => ['id' => $catalog->id, 'title' => $catalog->title]]);
    }
}
