<?php

use App\Http\Controllers\AddressController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\HomepageSectionController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PageController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\StripeWebhookController;
use Illuminate\Support\Facades\Route;

// Pubbliche - catalogo e giochi
Route::get('/pages/{slug}', [PageController::class, 'show']);
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{slug}/related', [ProductController::class, 'related']);
Route::get('/products/{slug}', [ProductController::class, 'show']);
Route::get('/games', [ProductController::class, 'games']);
Route::get('/homepage-sections', [HomepageSectionController::class, 'index']);
Route::get('/carousel-banners', [\App\Http\Controllers\CarouselBannerController::class, 'index']);

// Auth
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// Checkout (pubblico - funziona anche per guest)
Route::post('/checkout/create-session', [CheckoutController::class, 'createSession']);
Route::post('/checkout/confirm', [CheckoutController::class, 'confirm']);

// Stripe webhook - escluso da CSRF e auth
Route::post('/stripe/webhook', [StripeWebhookController::class, 'handle']);

// Autenticate
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::apiResource('/addresses', AddressController::class);
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{orderNumber}', [OrderController::class, 'show']);
});

// Admin
Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
    Route::post('/games/reorder', [App\Http\Controllers\Admin\GameController::class, 'reorder']);
    Route::apiResource('/games', App\Http\Controllers\Admin\GameController::class);
    Route::apiResource('/categories', App\Http\Controllers\Admin\CategoryController::class);
    Route::post('/categories/reorder', [App\Http\Controllers\Admin\CategoryController::class, 'reorder']);
    Route::apiResource('/products', App\Http\Controllers\Admin\ProductController::class);
    Route::post('/products/{product}/images', [App\Http\Controllers\Admin\ProductController::class, 'uploadImage']);
    Route::patch('/products/{product}/images/reorder', [App\Http\Controllers\Admin\ProductController::class, 'reorderImages']);
    Route::delete('/products/{product}/images/{imageId}', [App\Http\Controllers\Admin\ProductController::class, 'deleteImage']);
    Route::apiResource('/homepage-sections', App\Http\Controllers\Admin\HomepageSectionController::class)
        ->parameters(['homepage-sections' => 'homepageSection']);
    Route::post('/homepage-sections/reorder', [App\Http\Controllers\Admin\HomepageSectionController::class, 'reorder']);
    Route::get('/carousel-banners', [App\Http\Controllers\Admin\CarouselBannerController::class, 'index']);
    Route::post('/carousel-banners', [App\Http\Controllers\Admin\CarouselBannerController::class, 'store']);
    Route::post('/carousel-banners/reorder', [App\Http\Controllers\Admin\CarouselBannerController::class, 'reorder']);
    Route::patch('/carousel-banners/{carouselBanner}', [App\Http\Controllers\Admin\CarouselBannerController::class, 'update']);
    Route::delete('/carousel-banners/{carouselBanner}', [App\Http\Controllers\Admin\CarouselBannerController::class, 'destroy']);
    Route::get('/settings', [App\Http\Controllers\Admin\SettingController::class, 'index']);
    Route::patch('/settings', [App\Http\Controllers\Admin\SettingController::class, 'update']);
    Route::get('/orders', [App\Http\Controllers\Admin\OrderController::class, 'index']);
    Route::get('/orders/{order}', [App\Http\Controllers\Admin\OrderController::class, 'show']);
    Route::patch('/orders/{order}/status', [App\Http\Controllers\Admin\OrderController::class, 'updateStatus']);
    Route::patch('/orders/{order}/tracking', [App\Http\Controllers\Admin\OrderController::class, 'addTracking']);
    Route::get('/pages', [App\Http\Controllers\Admin\PageController::class, 'index']);
    Route::patch('/pages/{slug}', [App\Http\Controllers\Admin\PageController::class, 'update']);
});
