<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function stats(Request $request): JsonResponse
    {
        $period = $request->query('period', 'month');

        [$from, $to, $chartGroupBy] = $this->periodBounds($period);

        $base = Order::whereIn('status', ['paid', 'shipped', 'ready_for_pickup', 'picked_up', 'partially_refunded'])
            ->whereBetween('created_at', [$from, $to]);

        $revenue      = (float) (clone $base)->sum('total');
        $ordersCount  = (clone $base)->count();
        $avgOrder     = $ordersCount > 0 ? round($revenue / $ordersCount, 2) : 0.0;

        $byStatus = Order::whereBetween('created_at', [$from, $to])
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status');

        $byDelivery = Order::whereBetween('created_at', [$from, $to])
            ->whereIn('status', ['paid', 'shipped', 'ready_for_pickup', 'picked_up', 'partially_refunded'])
            ->select('delivery_method', DB::raw('count(*) as count'))
            ->groupBy('delivery_method')
            ->pluck('count', 'delivery_method');

        $chart = $this->chartData($from, $to, $chartGroupBy);

        $topProducts = OrderItem::join('orders', 'order_items.order_id', '=', 'orders.id')
            ->whereBetween('orders.created_at', [$from, $to])
            ->whereIn('orders.status', ['paid', 'shipped', 'ready_for_pickup', 'picked_up', 'partially_refunded'])
            ->select(
                DB::raw("JSON_UNQUOTE(JSON_EXTRACT(product_snapshot, '$.name')) as name"),
                DB::raw('SUM(order_items.quantity) as qty'),
                DB::raw('SUM(order_items.total_price) as revenue'),
            )
            ->groupBy('name')
            ->orderByDesc('revenue')
            ->limit(5)
            ->get();

        return response()->json([
            'revenue'      => $revenue,
            'orders_count' => $ordersCount,
            'avg_order'    => $avgOrder,
            'by_status'    => $byStatus,
            'by_delivery'  => $byDelivery,
            'chart'        => $chart,
            'top_products' => $topProducts,
        ]);
    }

    private function periodBounds(string $period): array
    {
        $now = now();

        return match ($period) {
            'today' => [$now->copy()->startOfDay(), $now->copy()->endOfDay(), 'hour'],
            'week'  => [$now->copy()->startOfWeek(), $now->copy()->endOfWeek(), 'day'],
            'year'  => [$now->copy()->startOfYear(), $now->copy()->endOfYear(), 'month'],
            default => [$now->copy()->startOfMonth(), $now->copy()->endOfMonth(), 'day'],
        };
    }

    private function chartData($from, $to, string $groupBy): array
    {
        $format = match ($groupBy) {
            'hour'  => '%Y-%m-%d %H:00',
            'month' => '%Y-%m',
            default => '%Y-%m-%d',
        };

        $rows = Order::whereIn('status', ['paid', 'shipped', 'ready_for_pickup', 'picked_up', 'partially_refunded'])
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
