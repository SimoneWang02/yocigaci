<?php

namespace App\Http\Controllers;

use App\Http\Resources\OrderResource;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class OrderController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $orders = $request->user()
            ->orders()
            ->orderByDesc('created_at')
            ->paginate(20);

        return OrderResource::collection($orders);
    }

    public function show(Request $request, string $orderNumber): OrderResource
    {
        $order = Order::where('order_number', $orderNumber)
            ->where('user_id', $request->user()->id)
            ->with(['items'])
            ->firstOrFail();

        return new OrderResource($order);
    }
}
