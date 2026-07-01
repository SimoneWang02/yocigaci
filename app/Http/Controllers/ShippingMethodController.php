<?php

namespace App\Http\Controllers;

use App\Models\ShippingMethod;
use Illuminate\Http\JsonResponse;

class ShippingMethodController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            ShippingMethod::active()->orderBy('sort_order')->orderBy('id')->get()
        );
    }
}
