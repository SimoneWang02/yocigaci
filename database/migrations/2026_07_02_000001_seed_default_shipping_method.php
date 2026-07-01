<?php

use App\Models\ShippingMethod;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Crea il metodo di spedizione attualmente configurato a mano in produzione,
     * cosi' che sia presente anche sugli altri ambienti dopo l'introduzione di
     * /admin/spedizioni.
     */
    public function up(): void
    {
        ShippingMethod::firstOrCreate(
            ['name' => 'DHL Express'],
            [
                'description' => null,
                'cost' => 16.90,
                'free_threshold' => 249.90,
                'is_active' => true,
                'sort_order' => 0,
            ],
        );
    }

    public function down(): void
    {
        ShippingMethod::where('name', 'DHL Express')->delete();
    }
};
