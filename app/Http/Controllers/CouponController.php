<?php

namespace App\Http\Controllers;

use App\Models\Coupon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    public function validate(Request $request): JsonResponse
    {
        $request->validate([
            'code'     => ['required', 'string'],
            'subtotal' => ['required', 'numeric', 'min:0'],
        ]);

        $coupon = Coupon::where('code', strtoupper($request->input('code')))->first();

        if (! $coupon || ! $coupon->isValid()) {
            return response()->json(['message' => 'Coupon non valido o scaduto.'], 422);
        }

        $discount = $coupon->calculateDiscount((float) $request->input('subtotal'));

        return response()->json([
            'code'            => $coupon->code,
            'type'            => $coupon->type,
            'value'           => $coupon->value,
            'discount_amount' => $discount,
        ]);
    }
}
