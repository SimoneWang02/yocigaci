<?php

namespace App\Http\Controllers;

use App\Models\Game;
use App\Models\Page;
use App\Models\Product;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    public function index(): Response
    {
        $base = rtrim(config('app.url'), '/');

        $entries = [];

        // Pagine statiche principali
        $entries[] = ['loc' => $base . '/',          'priority' => '1.0', 'changefreq' => 'weekly'];
        $entries[] = ['loc' => $base . '/catalogo',  'priority' => '0.9', 'changefreq' => 'daily'];

        // Pagine per gioco
        $games = Game::where('is_active', true)
            ->with(['categories' => fn ($q) => $q->where('is_active', true)])
            ->orderBy('sort_order')
            ->get();

        foreach ($games as $game) {
            $entries[] = [
                'loc'        => $base . '/catalogo/' . $game->slug,
                'priority'   => '0.8',
                'changefreq' => 'daily',
            ];
            foreach ($game->categories as $cat) {
                $entries[] = [
                    'loc'        => $base . '/catalogo/' . $game->slug . '/' . $cat->slug,
                    'priority'   => '0.7',
                    'changefreq' => 'daily',
                ];
            }
        }

        // Prodotti attivi
        Product::active()
            ->orderBy('updated_at', 'desc')
            ->select('slug', 'updated_at')
            ->each(function ($product) use (&$entries, $base) {
                $entries[] = [
                    'loc'      => $base . '/prodotti/' . $product->slug,
                    'lastmod'  => $product->updated_at->toAtomString(),
                    'priority' => '0.8',
                    'changefreq' => 'weekly',
                ];
            });

        // Pagine CMS
        Page::orderBy('updated_at', 'desc')
            ->select('slug', 'updated_at')
            ->each(function ($page) use (&$entries, $base) {
                $entries[] = [
                    'loc'     => $base . '/p/' . $page->slug,
                    'lastmod' => $page->updated_at->toAtomString(),
                    'priority' => '0.4',
                    'changefreq' => 'monthly',
                ];
            });

        $xml = view('sitemap', ['entries' => $entries])->render();

        return response($xml, 200, ['Content-Type' => 'application/xml']);
    }
}
