<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('preorders:convert-expired')->dailyAt('06:00');
Schedule::command('stock:release-expired')->everyFiveMinutes()->withoutOverlapping();
