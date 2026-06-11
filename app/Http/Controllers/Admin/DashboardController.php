<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    private const PAID_STATUSES = ['paid', 'shipped', 'ready_for_pickup', 'picked_up', 'partially_refunded'];

    public function stats(Request $request): JsonResponse
    {
        $period = $request->query('period', 'month');
        $offset = (int) $request->query('offset', 0);

        [$from, $to, $chartGroupBy] = $this->periodBounds($period, $offset);
        [$prevFrom, $prevTo]        = $this->periodBounds($period, $offset - 1);

        // Periodo corrente
        $base        = Order::whereIn('status', self::PAID_STATUSES)->whereBetween('created_at', [$from, $to]);
        $revenue     = (float) (clone $base)->sum('total');
        $ordersCount = (clone $base)->count();
        $avgOrder    = $ordersCount > 0 ? round($revenue / $ordersCount, 2) : 0.0;

        // Periodo precedente (per delta %)
        $prevBase        = Order::whereIn('status', self::PAID_STATUSES)->whereBetween('created_at', [$prevFrom, $prevTo]);
        $prevRevenue     = (float) (clone $prevBase)->sum('total');
        $prevOrdersCount = (clone $prevBase)->count();
        $prevAvgOrder    = $prevOrdersCount > 0 ? round($prevRevenue / $prevOrdersCount, 2) : 0.0;

        // Ordini da gestire (globale, indipendente dal periodo)
        $ordersToShip          = Order::where('status', 'paid')->count();
        $ordersToPickup        = Order::where('status', 'ready_for_pickup')->count();
        $preorderBase          = Order::whereIn('status', ['preorder_confirmed', 'preorder_ready']);
        $ordersPreorder        = (clone $preorderBase)->count();
        $ordersPreorderShip    = (clone $preorderBase)->where('delivery_method', 'shipping')->count();
        $ordersPreorderPickup  = (clone $preorderBase)->where('delivery_method', 'pickup')->count();
        $ordersCompleted       = Order::whereIn('status', ['shipped', 'picked_up'])->count();

        $expiredPreorders = Product::where('is_active', true)
            ->where('is_preorder', true)
            ->whereNotNull('preorder_release_date')
            ->where('preorder_release_date', '<', now()->toDateString())
            ->orderBy('preorder_release_date')
            ->get(['id', 'name', 'slug', 'preorder_release_date']);

        return response()->json([
            'revenue'           => $revenue,
            'orders_count'      => $ordersCount,
            'avg_order'         => $avgOrder,
            'prev_revenue'      => $prevRevenue,
            'prev_orders_count' => $prevOrdersCount,
            'prev_avg_order'    => $prevAvgOrder,
            'orders_to_ship'         => $ordersToShip,
            'orders_to_pickup'       => $ordersToPickup,
            'orders_preorder'        => $ordersPreorder,
            'orders_preorder_ship'   => $ordersPreorderShip,
            'orders_preorder_pickup' => $ordersPreorderPickup,
            'orders_completed'       => $ordersCompleted,
            'expired_preorders' => $expiredPreorders,
            'chart'             => $this->chartData($from, $to, $chartGroupBy),
        ]);
    }

    private function periodBounds(string $period, int $offset): array
    {
        $now = now();

        return match ($period) {
            'today' => [
                $now->copy()->addDays($offset)->startOfDay(),
                $now->copy()->addDays($offset)->endOfDay(),
                'hour',
            ],
            'week' => [
                $now->copy()->addWeeks($offset)->startOfWeek(),
                $now->copy()->addWeeks($offset)->endOfWeek(),
                'day',
            ],
            'year' => [
                $now->copy()->addYears($offset)->startOfYear(),
                $now->copy()->addYears($offset)->endOfYear(),
                'month',
            ],
            default => [
                $now->copy()->addMonths($offset)->startOfMonth(),
                $now->copy()->addMonths($offset)->endOfMonth(),
                'day',
            ],
        };
    }

    private function chartData($from, $to, string $groupBy): array
    {
        $format = match ($groupBy) {
            'hour'  => '%Y-%m-%d %H:00',
            'month' => '%Y-%m',
            default => '%Y-%m-%d',
        };

        $rows = Order::whereIn('status', self::PAID_STATUSES)
            ->whereBetween('created_at', [$from, $to])
            ->select(
                DB::raw("DATE_FORMAT(created_at, '{$format}') as label"),
                DB::raw('SUM(total) as revenue'),
                DB::raw('COUNT(*) as orders'),
            )
            ->groupBy('label')
            ->orderBy('label')
            ->get();

        return $rows->map(fn($r) => [
            'label'   => $r->label,
            'revenue' => (float) $r->revenue,
            'orders'  => (int) $r->orders,
        ])->values()->all();
    }
}
