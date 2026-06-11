<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('language', 10)->nullable()->after('category_id');
        });

        // Estrai la lingua dal nome per i prodotti esistenti
        $products = DB::table('products')->get(['id', 'name']);
        foreach ($products as $product) {
            $langCode = null;
            $cleanName = $product->name;

            if (preg_match('/^(.*?)\s*\[([A-Z]{2,4})\]\s*$/', $product->name, $m)) {
                $langCode = $m[2];
                $cleanName = trim($m[1]);
            } elseif (preg_match('/^\[([A-Z]{2,4})\]\s*(.*?)\s*$/', $product->name, $m)) {
                $langCode = $m[1];
                $cleanName = trim($m[2]);
            }

            DB::table('products')->where('id', $product->id)->update([
                'language' => $langCode,
                'name'     => $cleanName,
            ]);
        }
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('language');
        });
    }
};
