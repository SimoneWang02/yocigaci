<?php

use App\Models\Order;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Backfill: sostituisce i numeri d'ordine progressivi (ORD-YYYY-NNNN), che erano
     * indovinabili e quindi enumerabili tramite il tracking pubblico, con numeri casuali
     * generati dallo stesso schema usato dal model (ORD-YYYY-XXXXXXXX).
     *
     * Tocca solo gli ordini ancora nel vecchio formato sequenziale, così è sicura da
     * rieseguire e non altera eventuali ordini gia' randomizzati.
     */
    public function up(): void
    {
        Order::query()
            ->get()
            ->filter(fn (Order $order) => preg_match('/^ORD-\d{4}-\d{4}$/', $order->order_number))
            ->each(function (Order $order) {
                $order->forceFill([
                    'order_number' => Order::generateOrderNumber(),
                ])->saveQuietly();
            });
    }

    /**
     * Irreversibile: i progressivi originali non vengono conservati (e ricostruirli
     * reintrodurrebbe la vulnerabilita' di enumerazione).
     */
    public function down(): void
    {
        //
    }
};
