<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Importo totale rimborsato (cumulativo). Resta a 0 finche' non c'e' alcun rimborso.
            $table->decimal('refunded_amount', 10, 2)->default(0)->after('stripe_payment_status');
            // Valorizzato solo quando l'ordine viene rimborsato per intero: funge anche da
            // guardia di idempotenza per ripristino stock ed email (eseguiti una sola volta).
            $table->timestamp('refunded_at')->nullable()->after('refunded_amount');
            $table->string('refund_reason')->nullable()->after('refunded_at');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['refunded_amount', 'refunded_at', 'refund_reason']);
        });
    }
};
