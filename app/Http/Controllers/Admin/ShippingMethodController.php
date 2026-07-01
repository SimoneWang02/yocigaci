<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ShippingMethod;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ShippingMethodController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(ShippingMethod::orderBy('sort_order')->orderBy('id')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'description' => 'nullable|string|max:255',
            'cost' => 'required|numeric|min:0|max:9999',
            'free_threshold' => 'nullable|numeric|min:0|max:99999',
            'is_active' => 'boolean',
        ]);

        $data['sort_order'] = (ShippingMethod::max('sort_order') ?? -1) + 1;

        return response()->json(ShippingMethod::create($data), 201);
    }

    public function update(Request $request, ShippingMethod $shippingMethod): JsonResponse
    {
        $data = $request->validate([
            'name' => 'sometimes|string|max:100',
            'description' => 'sometimes|nullable|string|max:255',
            'cost' => 'sometimes|numeric|min:0|max:9999',
            'free_threshold' => 'sometimes|nullable|numeric|min:0|max:99999',
            'is_active' => 'sometimes|boolean',
            'sort_order' => 'sometimes|integer|min:0',
        ]);

        $shippingMethod->update($data);

        return response()->json($shippingMethod->fresh());
    }

    public function destroy(ShippingMethod $shippingMethod): JsonResponse
    {
        $shippingMethod->delete();

        return response()->json(['message' => 'Metodo di spedizione eliminato.']);
    }
}
