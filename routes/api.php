<?php

use App\Http\Controllers\AddressController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\HomepageSectionController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PageController;
use App\Http\Controllers\PasswordResetController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\StripeWebhookController;
use Illuminate\Support\Facades\Route;

// Pubbliche - catalogo e giochi
Route::get('/pages/{slug}', [PageController::class, 'show']);
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/search-suggestions', [ProductController::class, 'suggestions']);
Route::get('/products/facets', [ProductController::class, 'facets']);
Route::get('/products/{slug}/related', [ProductController::class, 'related']);
Route::get('/products/{slug}', [ProductController::class, 'show']);
Route::get('/games', [ProductController::class, 'games']);
Route::get('/homepage-sections', [HomepageSectionController::class, 'index']);
Route::get('/carousel-banners', [\App\Http\Controllers\CarouselBannerController::class, 'index']);
Route::get('/catalogs/{catalog}', [\App\Http\Controllers\CatalogController::class, 'show']);
Route::get('/settings', [\App\Http\Controllers\SettingController::class, 'index']);
Route::get('/shipping-methods', [\App\Http\Controllers\ShippingMethodController::class, 'index']);

// Auth (rate limit dedicato contro brute force e spam account)
Route::middleware('throttle:auth')->group(function () {
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::post('/auth/forgot-password', [PasswordResetController::class, 'sendLink']);
    Route::post('/auth/reset-password', [PasswordResetController::class, 'reset']);
});

// Checkout (pubblico - funziona anche per guest)
Route::post('/checkout/create-session', [CheckoutController::class, 'createSession'])->middleware('throttle:checkout');
Route::post('/checkout/confirm', [CheckoutController::class, 'confirm'])->middleware('throttle:checkout');
Route::post('/coupons/validate', [\App\Http\Controllers\CouponController::class, 'validate'])->middleware('throttle:coupon');

// Stripe webhook - escluso da CSRF, auth e rate limiting (burst legittimi da IP Stripe).
// La firma del webhook viene comunque verificata nel controller.
Route::post('/stripe/webhook', [StripeWebhookController::class, 'handle'])
    ->withoutMiddleware('throttle:api');

// Tracking pubblico (rate limit dedicato contro l'enumerazione degli ordini)
Route::post('/orders/track', [\App\Http\Controllers\OrderTrackingController::class, 'track'])->middleware('throttle:tracking');

// Autenticate
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::patch('/auth/password', [AuthController::class, 'changePassword']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::apiResource('/addresses', AddressController::class);
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{orderNumber}', [OrderController::class, 'show']);
});

// Admin
Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
    Route::get('/dashboard/stats', [App\Http\Controllers\Admin\DashboardController::class, 'stats']);
    Route::post('/games/reorder', [App\Http\Controllers\Admin\GameController::class, 'reorder']);
    Route::apiResource('/games', App\Http\Controllers\Admin\GameController::class);
    Route::apiResource('/categories', App\Http\Controllers\Admin\CategoryController::class);
    Route::post('/categories/reorder', [App\Http\Controllers\Admin\CategoryController::class, 'reorder']);
    Route::apiResource('/products', App\Http\Controllers\Admin\ProductController::class);
    Route::patch('/products/{product}/decrement-stock', [App\Http\Controllers\Admin\ProductController::class, 'decrementStock']);
    Route::patch('/products/{product}/increment-stock', [App\Http\Controllers\Admin\ProductController::class, 'incrementStock']);
    Route::post('/products/{product}/images', [App\Http\Controllers\Admin\ProductController::class, 'uploadImage']);
    Route::patch('/products/{product}/images/reorder', [App\Http\Controllers\Admin\ProductController::class, 'reorderImages']);
    Route::delete('/products/{product}/images/{imageId}', [App\Http\Controllers\Admin\ProductController::class, 'deleteImage']);
    Route::apiResource('/homepage-sections', App\Http\Controllers\Admin\HomepageSectionController::class)
        ->parameters(['homepage-sections' => 'homepageSection']);
    Route::post('/homepage-sections/reorder', [App\Http\Controllers\Admin\HomepageSectionController::class, 'reorder']);
    Route::apiResource('/catalogs', App\Http\Controllers\Admin\CatalogController::class);
    Route::get('/carousel-banners', [App\Http\Controllers\Admin\CarouselBannerController::class, 'index']);
    Route::post('/carousel-banners', [App\Http\Controllers\Admin\CarouselBannerController::class, 'store']);
    Route::post('/carousel-banners/reorder', [App\Http\Controllers\Admin\CarouselBannerController::class, 'reorder']);
    Route::patch('/carousel-banners/{carouselBanner}', [App\Http\Controllers\Admin\CarouselBannerController::class, 'update']);
    Route::delete('/carousel-banners/{carouselBanner}', [App\Http\Controllers\Admin\CarouselBannerController::class, 'destroy']);
    Route::get('/settings', [App\Http\Controllers\Admin\SettingController::class, 'index']);
    Route::patch('/settings', [App\Http\Controllers\Admin\SettingController::class, 'update']);
    Route::get('/orders/new-count', [App\Http\Controllers\Admin\OrderController::class, 'newCount']);
    Route::post('/orders/mark-seen', [App\Http\Controllers\Admin\OrderController::class, 'markSeen']);
    Route::get('/orders', [App\Http\Controllers\Admin\OrderController::class, 'index']);
    Route::get('/orders/{order}', [App\Http\Controllers\Admin\OrderController::class, 'show']);
    Route::patch('/orders/{order}/tracking', [App\Http\Controllers\Admin\OrderController::class, 'addTracking']);
    Route::post('/orders/{order}/notify-pickup', [App\Http\Controllers\Admin\OrderController::class, 'notifyPickupReady']);
    Route::post('/orders/{order}/confirm-pickup', [App\Http\Controllers\Admin\OrderController::class, 'confirmPickup']);
    Route::post('/orders/{order}/unconfirm-pickup', [App\Http\Controllers\Admin\OrderController::class, 'unconfirmPickup']);
    Route::post('/orders/{order}/refund', [App\Http\Controllers\Admin\OrderController::class, 'refund']);
    Route::get('/pages', [App\Http\Controllers\Admin\PageController::class, 'index']);
    Route::patch('/pages/{slug}', [App\Http\Controllers\Admin\PageController::class, 'update']);
    Route::apiResource('/coupons', App\Http\Controllers\Admin\CouponController::class)->except(['show']);
    Route::apiResource('/shipping-methods', App\Http\Controllers\Admin\ShippingMethodController::class)->except(['show']);
});
