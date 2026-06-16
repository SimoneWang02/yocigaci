<?php

namespace App\Http\Middleware;

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

        if (preg_match('#^prodotti/([^/]+)$#', $path, $m)) {
            return $this->prerenderProduct($m[1]);
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
}
