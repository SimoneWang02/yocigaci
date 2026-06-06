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
            'preorder_confirmed', 'preorder_ready'
        ) NOT NULL DEFAULT 'pending'");
    }

    public function down(): void
    {
        // Riporta eventuali ordini parzialmente rimborsati a uno stato valido
        // prima di rimuovere il valore dall'enum.
        DB::table('orders')->where('status', 'partially_refunded')->update(['status' => 'paid']);

        DB::statement("ALTER TABLE orders MODIFY status ENUM(
            'pending', 'paid', 'processing', 'shipped', 'delivered',
            'cancelled', 'refunded', 'preorder_confirmed', 'preorder_ready'
        ) NOT NULL DEFAULT 'pending'");
    }
};
