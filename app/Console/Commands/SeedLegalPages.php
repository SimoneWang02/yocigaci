<?php

namespace App\Console\Commands;

use Database\Seeders\PageSeeder;
use Illuminate\Console\Command;

class SeedLegalPages extends Command
{
    protected $signature = 'pages:seed-legal';
    protected $description = 'Aggiorna le pagine legali nel database (privacy, termini, recesso, resi, spedizioni, cookie, recapiti)';

    public function handle(): int
    {
        $this->info('Aggiornamento pagine legali...');
        $this->call('db:seed', ['--class' => PageSeeder::class]);
        $this->info('Pagine legali aggiornate.');

        return Command::SUCCESS;
    }
}
