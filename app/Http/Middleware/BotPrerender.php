<?php

namespace App\Http\Middleware;

use App\Models\Category;
use App\Models\Game;
use App\Models\Page;
use App\Models\Product;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class BotPrerender
{
    private const BOTS = [
        'googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider',
        'yandexbot', 'facebookexternalhit', 'twitterbot', 'linkedinbot',
        'whatsapp', 'telegrambot', 'applebot', 'ia_archiver', 'semrushbot',
        'ahrefsbot', 'mj12bot',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        if (! $this->isBot($request)) {
            return $next($request);
        }

        $path = trim($request->path(), '/');

        if ($path === '') {
            return $this->prerenderHome();
        }

        if ($path === 'catalogo') {
            return $this->prerenderCatalog();
        }

        if (preg_match('#^prodotti/([^/]+)$#', $path, $m)) {
            return $this->prerenderProduct($m[1]);
        }

        if (preg_match('#^catalogo/([^/]+)/([^/]+)$#', $path, $m)) {
            return $this->prerenderCategory($m[1], $m[2]);
        }

        if (preg_match('#^catalogo/([^/]+)$#', $path, $m)) {
            return $this->prerenderGame($m[1]);
        }

        if (preg_match('#^p/([^/]+)$#', $path, $m)) {
            return $this->prerenderPage($m[1]);
        }

        return $next($request);
    }

    private function isBot(Request $request): bool
    {
        $ua = strtolower($request->userAgent() ?? '');
        foreach (self::BOTS as $bot) {
            if (str_contains($ua, $bot)) {
                return true;
            }
        }
        return false;
    }

    private function prerenderHome(): Response
    {
        $games = Game::where('is_active', true)
            ->with(['categories' => fn ($q) => $q->where('is_active', true)->orderBy('sort_order')])
            ->orderBy('sort_order')
            ->get();

        return response()->view('prerender.home', compact('games'));
    }

    private function prerenderCatalog(): Response
    {
        $games = Game::where('is_active', true)
            ->with(['categories' => fn ($q) => $q->where('is_active', true)->orderBy('sort_order')])
            ->orderBy('sort_order')
            ->get();

        return response()->view('prerender.catalog', compact('games'));
    }

    private function prerenderGame(string $slug): Response
    {
        $game = Game::where('slug', $slug)
            ->where('is_active', true)
            ->with(['categories' => fn ($q) => $q->where('is_active', true)->orderBy('sort_order')])
            ->first();

        if (! $game) {
            return response('Not Found', 404);
        }

        $products = Product::active()
            ->where('game_id', $game->id)
            ->with(['primaryImage'])
            ->orderBy('sort_order')
            ->limit(24)
            ->get();

        return response()->view('prerender.game', compact('game', 'products'));
    }

    private function prerenderCategory(string $gameSlug, string $categorySlug): Response
    {
        $game = Game::where('slug', $gameSlug)
            ->where('is_active', true)
            ->first();

        if (! $game) {
            return response('Not Found', 404);
        }

        $category = Category::where('slug', $categorySlug)
            ->where('game_id', $game->id)
            ->where('is_active', true)
            ->first();

        if (! $category) {
            return response('Not Found', 404);
        }

        $products = Product::active()
            ->where('game_id', $game->id)
            ->where('category_id', $category->id)
            ->with(['primaryImage'])
            ->orderBy('sort_order')
            ->limit(24)
            ->get();

        return response()->view('prerender.category', compact('game', 'category', 'products'));
    }

    private function prerenderProduct(string $slug): Response
    {
        $product = Product::active()
            ->where('slug', $slug)
            ->with(['images', 'primaryImage', 'game', 'category'])
            ->first();

        if (! $product) {
            return response('Not Found', 404);
        }

        return response()->view('prerender.product', compact('product'));
    }

    private function prerenderPage(string $slug): Response
    {
        $page = Page::where('slug', $slug)->first();

        if (! $page) {
            return response('Not Found', 404);
        }

        return response()->view('prerender.page', compact('page'));
    }
}
