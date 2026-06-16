<?php

namespace App\Console\Commands;

use App\Models\Product;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

class ConvertExpiredPreorders extends Command
{
    protected $signature = 'preorders:convert-expired';

    protected $description = 'Converte in prodotti normali i preordini con data di uscita superata';

    public function handle(): int
    {
        $count = Product::where('is_preorder', true)
            ->whereNotNull('preorder_release_date')
            ->whereDate('preorder_release_date', '<', Carbon::today())
            ->update([
                'is_preorder' => false,
                'preorder_release_date' => null,
                'preorder_note' => null,
            ]);

        $this->info("Convertiti {$count} preordini scaduti.");

        return self::SUCCESS;
    }
}
