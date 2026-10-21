<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stock_reservations', function (Blueprint $table) {
            $table->id();
            $table->string('stripe_session_id')->nullable()->unique();
            // [{product_id, quantity}, ...]: le quantita' scalate dallo stock alla prenotazione.
            $table->json('items');
            $table->string('status')->default('pending');
            $table->timestamp('expires_at');
            $table->timestamps();
            $table->index(['status', 'expires_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_reservations');
    }
};
