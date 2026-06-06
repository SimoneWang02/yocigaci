<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use App\Services\OrderFulfillmentService;
use Illuminate\Http\JsonResponse;

class SettingController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => [
                'cardtrader_label' => Setting::getValue('cardtrader_label', 'CardTrader'),
                'cardtrader_url' => Setting::getValue('cardtrader_url', 'https://www.cardtrader.com/en/users/yocigaci888'),
                'shipping_cost' => (float) Setting::getValue('shipping_cost', OrderFulfillmentService::DEFAULT_SHIPPING_COST),
                'shipping_free_threshold' => (float) Setting::getValue('shipping_free_threshold', OrderFulfillmentService::DEFAULT_SHIPPING_FREE_THRESHOLD),
            ],
        ]);
    }
}
