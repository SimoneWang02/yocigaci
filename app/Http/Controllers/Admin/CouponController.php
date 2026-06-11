<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Coupon::orderByDesc('created_at')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'code'        => ['required', 'string', 'max:50', 'unique:coupons,code'],
            'type'        => ['required', 'in:percentage,fixed'],
            'value'       => ['required', 'numeric', 'min:0.01'],
            'valid_from'  => ['nullable', 'date'],
            'valid_to'    => ['nullable', 'date', 'after_or_equal:valid_from'],
            'usage_limit' => ['nullable', 'integer', 'min:1'],
            'is_active'   => ['boolean'],
        ]);

        $data['code'] = strtoupper($data['code']);

        return response()->json(Coupon::create($data), 201);
    }

    public function update(Request $request, Coupon $coupon): JsonResponse
    {
        $data = $request->validate([
            'code'        => ['sometimes', 'required', 'string', 'max:50', "unique:coupons,code,{$coupon->id}"],
            'type'        => ['sometimes', 'required', 'in:percentage,fixed'],
            'value'       => ['sometimes', 'required', 'numeric', 'min:0.01'],
            'valid_from'  => ['nullable', 'date'],
            'valid_to'    => ['nullable', 'date', 'after_or_equal:valid_from'],
            'usage_limit' => ['nullable', 'integer', 'min:1'],
            'is_active'   => ['boolean'],
        ]);

        if (isset($data['code'])) {
            $data['code'] = strtoupper($data['code']);
        }

        $coupon->update($data);

        return response()->json($coupon->fresh());
    }

    public function destroy(Coupon $coupon): JsonResponse
    {
        $coupon->delete();

        return response()->json(null, 204);
    }
}
