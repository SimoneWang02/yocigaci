<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Pre-flight: se esistono gia' ordini duplicati per lo stesso pagamento
        // (il bug che questo indice previene), l'aggiunta dell'indice fallirebbe con
        // un errore SQL oscuro. Blocchiamo prima con un messaggio azionabile: ogni
        // duplicato e' un ordine pagato che richiede una decisione umana (rimborso/merge),
        // quindi NON tocchiamo i dati automaticamente.
        $duplicates = DB::table('orders')
            ->select('stripe_payment_intent_id')
            ->whereNotNull('stripe_payment_intent_id')
            ->groupBy('stripe_payment_intent_id')
            ->havingRaw('COUNT(*) > 1')
            ->pluck('stripe_payment_intent_id');

        if ($duplicates->isNotEmpty()) {
            throw new RuntimeException(
                'Impossibile aggiungere l\'indice unico: esistono ordini duplicati per i '
                .'seguenti stripe_payment_intent_id. Risolverli manualmente prima di migrare: '
                .$duplicates->implode(', ')
            );
        }

        Schema::table('orders', function (Blueprint $table) {
            // Garantisce l'idempotenza della creazione ordine: webhook e pagina di
            // conferma non possono creare due ordini per lo stesso pagamento.
            $table->unique('stripe_payment_intent_id');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropUnique(['stripe_payment_intent_id']);
        });
    }
};
