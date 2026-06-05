<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
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
            ],
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'carousel_enabled' => 'sometimes|boolean',
            'cardtrader_label' => 'sometimes|string|max:50',
            'cardtrader_url' => 'sometimes|url|max:500',
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
