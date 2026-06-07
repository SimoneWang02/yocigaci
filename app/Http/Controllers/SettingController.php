<?php

namespace App\Http\Controllers;

use App\Models\Setting;
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
                'cardtrader_label' => Setting::getValue('cardtrader_label'),
                'cardtrader_url' => Setting::getValue('cardtrader_url'),
                'shipping_cost' => Setting::getValue('shipping_cost') !== null ? (float) Setting::getValue('shipping_cost') : null,
                'shipping_free_threshold' => Setting::getValue('shipping_free_threshold') !== null ? (float) Setting::getValue('shipping_free_threshold') : null,
                'whatsapp_number' => Setting::getValue('whatsapp_number'),
                'opening_hours' => $openingHours,
            ],
        ]);
    }
}
