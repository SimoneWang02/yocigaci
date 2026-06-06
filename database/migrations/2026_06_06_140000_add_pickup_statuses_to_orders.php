<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE orders MODIFY status ENUM(
            'pending', 'paid', 'processing', 'shipped', 'delivered',
            'cancelled', 'partially_refunded', 'refunded',
            'preorder_confirmed', 'preorder_ready',
            'ready_for_pickup', 'picked_up'
        ) NOT NULL DEFAULT 'pending'");
    }

    public function down(): void
    {
        DB::table('orders')->whereIn('status', ['ready_for_pickup', 'picked_up'])->update(['status' => 'paid']);

        DB::statement("ALTER TABLE orders MODIFY status ENUM(
            'pending', 'paid', 'processing', 'shipped', 'delivered',
            'cancelled', 'partially_refunded', 'refunded',
            'preorder_confirmed', 'preorder_ready'
        ) NOT NULL DEFAULT 'pending'");
    }
};
