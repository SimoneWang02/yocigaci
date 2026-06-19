<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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
        $settings = Setting::whereIn('key', ['carousel_enabled'])->pluck('value', 'key');

        $rawHours = Setting::getValue('opening_hours', null);
        $openingHours = $rawHours ? json_decode($rawHours, true) : self::defaultOpeningHours();

        return response()->json([
            'data' => [
                'carousel_enabled' => $settings['carousel_enabled'] ?? '1',
                'cardtrader_label' => Setting::getValue('cardtrader_label'),
                'cardtrader_url' => Setting::getValue('cardtrader_url'),
                'shipping_cost' => Setting::getValue('shipping_cost') !== null ? (float) Setting::getValue('shipping_cost') : null,
                'shipping_free_threshold' => Setting::getValue('shipping_free_threshold') !== null ? (float) Setting::getValue('shipping_free_threshold') : null,
                'whatsapp_number' => Setting::getValue('whatsapp_number'),
                'support_email' => Setting::getValue('support_email', 'assistenza.yocigaci@gmail.com'),
                'order_notification_email' => Setting::getValue('order_notification_email'),
                'opening_hours' => $openingHours,
            ],
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'carousel_enabled' => 'sometimes|boolean',
            'cardtrader_label' => 'sometimes|nullable|string|max:50',
            'cardtrader_url' => 'sometimes|nullable|url|max:500',
            'shipping_cost' => 'sometimes|numeric|min:0|max:9999',
            'shipping_free_threshold' => 'sometimes|numeric|min:0|max:99999',
            'whatsapp_number' => 'sometimes|nullable|string|max:30',
            'support_email' => 'sometimes|nullable|email|max:100',
            'order_notification_email' => 'sometimes|nullable|email|max:100',
            'opening_hours' => 'sometimes|array|size:7',
            'opening_hours.*.day' => 'required|string|max:20',
            'opening_hours.*.hours' => 'required|string|max:100',
        ]);

        foreach ($data as $key => $value) {
            if ($key === 'carousel_enabled') {
                $value = $value ? '1' : '0';
            } elseif ($key === 'opening_hours') {
                $value = json_encode($value);
            } elseif ($value === null) {
                $value = '';
            }
            Setting::setValue($key, $value);
        }

        return response()->json(['message' => 'Impostazioni salvate.']);
    }
}
