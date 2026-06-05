<?php

namespace Database\Seeders;

use App\Models\Page;
use Illuminate\Database\Seeder;

class PageSeeder extends Seeder
{
    public function run(): void
    {
        $pages = [
            [
                'slug' => 'privacy',
                'title' => 'Informativa sulla Privacy',
                'content' => '<p>Contenuto informativa sulla privacy da compilare.</p>',
            ],
            [
                'slug' => 'termini-e-condizioni',
                'title' => 'Termini e Condizioni del Servizio',
                'content' => '<p>Contenuto termini e condizioni da compilare.</p>',
            ],
            [
                'slug' => 'resi-e-rimborsi',
                'title' => 'Resi e Rimborsi',
                'content' => '<p>Contenuto informativa resi e rimborsi da compilare.</p>',
            ],
            [
                'slug' => 'diritto-di-recesso',
                'title' => 'Diritto di Recesso',
                'content' => '<p>Contenuto diritto di recesso da compilare.</p>',
            ],
            [
                'slug' => 'spedizioni',
                'title' => 'Informazioni sulle Spedizioni',
                'content' => '<p>Contenuto informazioni spedizioni da compilare.</p>',
            ],
            [
                'slug' => 'recapiti',
                'title' => 'Recapiti',
                'content' => '<p>Contenuto recapiti da compilare.</p>',
            ],
            [
                'slug' => 'cookie',
                'title' => 'Informativa sui Cookie',
                'content' => '<p>Contenuto informativa cookie da compilare.</p>',
            ],
        ];

        foreach ($pages as $page) {
            Page::firstOrCreate(['slug' => $page['slug']], $page);
        }
    }
}
