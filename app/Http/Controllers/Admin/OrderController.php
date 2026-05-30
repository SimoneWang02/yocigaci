<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Mail\OrderShipped;
use App\Mail\PreorderReady;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Mail;

class OrderController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Order::with(['user'])->orderByDesc('created_at');

        if ($request->status) {
            $query->where('status', $request->status);
        }
        if ($request->type) {
            $query->where('type', $request->type);
        }

        return OrderResource::collection($query->paginate(50));
    }

    public function show(Order $order): OrderResource
    {
        return new OrderResource($order->load(['items', 'user']));
    }

    public function updateStatus(Request $request, Order $order): OrderResource
    {
        $request->validate([
            'status' => ['required', 'in:pending,paid,processing,shipped,delivered,cancelled,refunded,preorder_confirmed,preorder_ready'],
        ]);

        $order->update(['status' => $request->status]);

        if ($request->status === 'shipped' && $order->user) {
            Mail::to($order->user->email)->queue(new OrderShipped($order));
        }

        if ($request->status === 'preorder_ready' && $order->user) {
            Mail::to($order->user->email)->queue(new PreorderReady($order));
        }

        return new OrderResource($order->load(['items', 'user']));
    }

    public function addTracking(Request $request, Order $order): OrderResource
    {
        $request->validate([
            'tracking_code' => ['required', 'string', 'max:255'],
        ]);

        $order->update([
            'tracking_code' => $request->tracking_code,
            'shipped_at' => now(),
            'status' => 'shipped',
        ]);

        if ($order->user) {
            Mail::to($order->user->email)->queue(new OrderShipped($order));
        }

        return new OrderResource($order->load(['items', 'user']));
    }
}
