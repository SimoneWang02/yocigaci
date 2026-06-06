<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Services\OrderFulfillmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    public function index(): JsonResponse
    {
        $settings = Setting::whereIn('key', ['carousel_enabled'])->pluck('value', 'key');

        return response()->json([
            'data' => [
                'carousel_enabled' => $settings['carousel_enabled'] ?? '1',
                'cardtrader_label' => Setting::getValue('cardtrader_label', 'CardTrader'),
                'cardtrader_url' => Setting::getValue('cardtrader_url', 'https://www.cardtrader.com/en/users/yocigaci888'),
                'shipping_cost' => (float) Setting::getValue('shipping_cost', OrderFulfillmentService::DEFAULT_SHIPPING_COST),
                'shipping_free_threshold' => (float) Setting::getValue('shipping_free_threshold', OrderFulfillmentService::DEFAULT_SHIPPING_FREE_THRESHOLD),
            ],
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'carousel_enabled' => 'sometimes|boolean',
            'cardtrader_label' => 'sometimes|string|max:50',
            'cardtrader_url' => 'sometimes|url|max:500',
            'shipping_cost' => 'sometimes|numeric|min:0|max:9999',
            'shipping_free_threshold' => 'sometimes|numeric|min:0|max:99999',
        ]);

        foreach ($data as $key => $value) {
            if ($key === 'carousel_enabled') {
                $value = $value ? '1' : '0';
            }
            Setting::setValue($key, $value);
        }

        return response()->json(['message' => 'Impostazioni salvate.']);
    }
}
