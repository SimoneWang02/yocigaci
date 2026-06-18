<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureRateLimiting();
    }

    /**
     * Rate limiter usati dalle route API. Il limite di default ('api') protegge
     * l'intera superficie; i limiti dedicati irrigidiscono gli endpoint sensibili.
     */
    private function configureRateLimiting(): void
    {
        // Default per tutte le route API: chiave per utente autenticato o IP.
        RateLimiter::for('api', fn (Request $request) => Limit::perMinute(120)->by(
            $request->user()?->id ?: $request->ip()
        ));

        // Endpoint di autenticazione/account non autenticati: brute force, spam account.
        RateLimiter::for('auth', fn (Request $request) => Limit::perMinute(10)->by($request->ip()));

        // Tracking ordini pubblico: previene l'enumerazione dei numeri d'ordine.
        RateLimiter::for('tracking', fn (Request $request) => Limit::perMinute(10)->by($request->ip()));

        // Validazione coupon: previene il brute force dei codici.
        RateLimiter::for('coupon', fn (Request $request) => Limit::perMinute(15)->by($request->ip()));

        // Creazione sessioni di checkout: previene lo spam di sessioni/coupon Stripe.
        RateLimiter::for('checkout', fn (Request $request) => Limit::perMinute(20)->by(
            $request->user('sanctum')?->id ?: $request->ip()
        ));
    }
}
