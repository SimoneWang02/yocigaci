<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\JsonResponse;

class SettingController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => [
                'cardtrader_label' => Setting::getValue('cardtrader_label', 'CardTrader'),
                'cardtrader_url' => Setting::getValue('cardtrader_url', 'https://www.cardtrader.com/en/users/yocigaci888'),
            ],
        ]);
    }
}
