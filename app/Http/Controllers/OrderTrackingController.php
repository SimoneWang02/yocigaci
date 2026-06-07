<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderTrackingController extends Controller
{
    public function track(Request $request): JsonResponse
    {
        $request->validate([
            'order_number' => ['required', 'string'],
            'email'        => ['required', 'email'],
        ]);

        $order = Order::where('order_number', $request->order_number)->first();

        if (! $order || strtolower($order->recipientEmail()) !== strtolower($request->email)) {
            return response()->json(['message' => 'Ordine non trovato. Verifica numero ordine ed email.'], 404);
        }

        $statusLabels = [
            'paid'               => 'Pagato',
            'shipped'            => 'Spedito',
            'ready_for_pickup'   => 'Pronto al ritiro',
            'picked_up'          => 'Ritirato',
            'refunded'           => 'Rimborsato',
            'preorder_confirmed' => 'Preordine Confermato',
        ];

        return response()->json([
            'data' => [
                'order_number'    => $order->order_number,
                'status'          => $order->status,
                'status_label'    => $statusLabels[$order->status] ?? $order->status,
                'delivery_method' => $order->delivery_method,
                'tracking_code'   => $order->tracking_code,
                'shipped_at'      => $order->shipped_at?->toIso8601String(),
                'created_at'      => $order->created_at->toIso8601String(),
            ],
        ]);
    }
}
