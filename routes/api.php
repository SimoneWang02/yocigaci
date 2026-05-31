<?php

use App\Http\Controllers\AddressController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\HomepageSectionController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\StripeWebhookController;
use Illuminate\Support\Facades\Route;

// Pubbliche - catalogo e giochi
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{slug}', [ProductController::class, 'show']);
Route::get('/games', [ProductController::class, 'games']);
Route::get('/homepage-sections', [HomepageSectionController::class, 'index']);

// Auth
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// Checkout (pubblico - funziona anche per guest)
Route::post('/checkout/create-intent', [CheckoutController::class, 'createIntent']);
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
    Route::apiResource('/games', App\Http\Controllers\Admin\GameController::class);
    Route::apiResource('/categories', App\Http\Controllers\Admin\CategoryController::class);
    Route::apiResource('/products', App\Http\Controllers\Admin\ProductController::class);
    Route::post('/products/{product}/images', [App\Http\Controllers\Admin\ProductController::class, 'uploadImage']);
    Route::patch('/products/{product}/images/reorder', [App\Http\Controllers\Admin\ProductController::class, 'reorderImages']);
    Route::delete('/products/{product}/images/{imageId}', [App\Http\Controllers\Admin\ProductController::class, 'deleteImage']);
    Route::apiResource('/homepage-sections', App\Http\Controllers\Admin\HomepageSectionController::class)
        ->parameters(['homepage-sections' => 'homepageSection']);
    Route::get('/orders', [App\Http\Controllers\Admin\OrderController::class, 'index']);
    Route::get('/orders/{order}', [App\Http\Controllers\Admin\OrderController::class, 'show']);
    Route::patch('/orders/{order}/status', [App\Http\Controllers\Admin\OrderController::class, 'updateStatus']);
    Route::patch('/orders/{order}/tracking', [App\Http\Controllers\Admin\OrderController::class, 'addTracking']);
});
