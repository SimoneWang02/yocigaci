<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use App\Services\OrderFulfillmentService;
use Illuminate\Http\JsonResponse;

class SettingController extends Controller
{
    private static function defaultOpeningHours(): array
    {
        return [
            ['day' => 'Lunedi',    'hours' => '15:30 - 19:30'],
            ['day' => 'Martedi',   'hours' => '11:00 - 13:00, 15:30 - 19:30'],
            ['day' => 'Mercoledi', 'hours' => '11:00 - 13:00, 15:30 - 19:30'],
            ['day' => 'Giovedi',   'hours' => '11:00 - 13:00, 15:30 - 19:30'],
            ['day' => 'Venerdi',   'hours' => '11:00 - 13:00, 15:30 - 19:30'],
            ['day' => 'Sabato',    'hours' => '11:00 - 19:30'],
            ['day' => 'Domenica',  'hours' => '11:00 - 13:00, 15:30 - 19:30'],
        ];
    }

    public function index(): JsonResponse
    {
        $rawHours = Setting::getValue('opening_hours', null);
        $openingHours = $rawHours ? json_decode($rawHours, true) : self::defaultOpeningHours();

        return response()->json([
            'data' => [
                'cardtrader_label' => Setting::getValue('cardtrader_label', 'CardTrader'),
                'cardtrader_url' => Setting::getValue('cardtrader_url', 'https://www.cardtrader.com/en/users/yocigaci888'),
                'shipping_cost' => (float) Setting::getValue('shipping_cost', OrderFulfillmentService::DEFAULT_SHIPPING_COST),
                'shipping_free_threshold' => (float) Setting::getValue('shipping_free_threshold', OrderFulfillmentService::DEFAULT_SHIPPING_FREE_THRESHOLD),
                'opening_hours' => $openingHours,
            ],
        ]);
    }
}
