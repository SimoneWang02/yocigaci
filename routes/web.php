<?php

use Illuminate\Support\Facades\Route;

// Catch-all: tutto il routing è gestito da React Router
Route::get('/{any}', function () {
    return view('spa');
})->where('any', '.*');
