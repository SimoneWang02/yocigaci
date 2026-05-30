<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('status', [
                'pending', 'paid', 'processing', 'shipped', 'delivered',
                'cancelled', 'refunded', 'preorder_confirmed', 'preorder_ready'
            ])->default('pending');
            $table->enum('type', ['standard', 'preorder'])->default('standard');
            $table->decimal('subtotal', 10, 2);
            $table->decimal('shipping_cost', 10, 2);
            $table->decimal('total', 10, 2);
            $table->json('shipping_address');
            $table->text('notes')->nullable();
            $table->string('stripe_payment_intent_id')->nullable();
            $table->string('stripe_payment_status')->nullable();
            $table->timestamp('shipped_at')->nullable();
            $table->string('tracking_code')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
