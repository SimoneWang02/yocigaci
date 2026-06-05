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

        return response()->json(['data' => $settings]);
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'carousel_enabled' => 'sometimes|boolean',
        ]);

        foreach ($data as $key => $value) {
            Setting::setValue($key, $value ? '1' : '0');
        }

        return response()->json(['message' => 'Impostazioni salvate.']);
    }
}
