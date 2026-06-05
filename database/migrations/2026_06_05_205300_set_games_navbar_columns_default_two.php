<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('games', function (Blueprint $table) {
            $table->tinyInteger('navbar_columns')->default(2)->change();
        });

        DB::table('games')->update(['navbar_columns' => 2]);
    }

    public function down(): void
    {
        Schema::table('games', function (Blueprint $table) {
            $table->tinyInteger('navbar_columns')->default(1)->change();
        });
    }
};
