<?php

use App\Http\Controllers\SitemapController;
use Illuminate\Support\Facades\Route;

Route::get('/sitemap.xml', [SitemapController::class, 'index']);

// Catch-all: tutto il routing è gestito da React Router
Route::get('/{any}', function () {
    return view('spa');
})->where('any', '.*');
