<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CategoryController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Category::with('game')->orderBy('sort_order');

        if ($request->game_id) {
            $query->where('game_id', $request->game_id);
        }

        return CategoryResource::collection($query->get());
    }

    public function store(CategoryRequest $request): CategoryResource
    {
        return new CategoryResource(Category::create($request->validated()));
    }

    public function show(Category $category): CategoryResource
    {
        return new CategoryResource($category->load('game'));
    }

    public function update(CategoryRequest $request, Category $category): CategoryResource
    {
        $category->update($request->validated());

        return new CategoryResource($category);
    }

    public function destroy(Category $category): JsonResponse
    {
        $category->delete();

        return response()->json(['message' => 'Categoria eliminata.']);
    }
}
