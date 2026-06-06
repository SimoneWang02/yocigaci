<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Mail\OrderShipped;
use App\Mail\PickupReady;
use App\Models\Order;
use App\Services\RefundService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Mail;
use Stripe\Exception\ApiErrorException;

class OrderController extends Controller
{
    public function __construct(private readonly RefundService $refunds)
    {
    }

    public function newCount(Request $request): \Illuminate\Http\JsonResponse
    {
        $since = $request->user()->last_seen_orders_at;

        $count = Order::when($since, fn($q) => $q->where('created_at', '>', $since))
            ->count();

        return response()->json(['count' => $count]);
    }

    public function markSeen(Request $request): \Illuminate\Http\JsonResponse
    {
        $request->user()->update(['last_seen_orders_at' => now()]);

        return response()->json(['ok' => true]);
    }

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
            Mail::to($order->user->email)->send(new OrderShipped($order));
        }

        return new OrderResource($order->load(['items', 'user']));
    }

    public function notifyPickupReady(Order $order): OrderResource
    {
        abort_if($order->delivery_method !== 'pickup', 422, 'Questo ordine non è un ritiro in negozio.');

        $order->update(['status' => 'ready_for_pickup']);

        $email = $order->recipientEmail();
        if ($email) {
            Mail::to($email)->send(new PickupReady($order));
        }

        return new OrderResource($order->fresh()->load(['items', 'user']));
    }

    public function confirmPickup(Order $order): OrderResource
    {
        abort_if($order->delivery_method !== 'pickup', 422, 'Questo ordine non è un ritiro in negozio.');

        $order->update(['status' => 'picked_up', 'picked_up_at' => now()]);

        return new OrderResource($order->fresh()->load(['items', 'user']));
    }

    /**
     * Emette un rimborso Stripe (totale o parziale) per l'ordine.
     *
     * L'importo e' opzionale: se assente rimborsa tutto il residuo. Lo stato
     * dell'ordine passa a "refunded" solo a rimborso totale completato.
     */
    public function refund(Request $request, Order $order): OrderResource
    {
        $validated = $request->validate([
            'amount' => ['nullable', 'numeric', 'min:0.01', 'max:' . $order->refundableAmount()],
            'reason' => ['nullable', 'in:' . implode(',', RefundService::STRIPE_REASONS)],
        ]);

        try {
            $this->refunds->issueRefund(
                $order,
                $validated['amount'] ?? null,
                $validated['reason'] ?? null,
            );
        } catch (\RuntimeException $e) {
            abort(422, $e->getMessage());
        } catch (ApiErrorException $e) {
            // Errore lato Stripe (saldo insufficiente, charge gia' rimborsato, ecc.):
            // lo restituiamo leggibile all'admin invece di un 500 opaco.
            abort(422, $e->getMessage());
        }

        return new OrderResource($order->fresh()->load(['items', 'user']));
    }
}
