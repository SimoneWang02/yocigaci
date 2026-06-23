<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('products')->where('language', 'JAP')->update(['language' => 'JPN']);
    }

    public function down(): void
    {
        DB::table('products')->where('language', 'JPN')->update(['language' => 'JAP']);
    }
};
