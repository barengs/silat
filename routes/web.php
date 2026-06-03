<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes — SIMTAG Disdik Pamekasan
|--------------------------------------------------------------------------
| All web requests are served by the React SPA shell (app.blade.php).
| React Router handles all client-side routing.
| The only exception is Laravel's /api/* and /up (health) routes.
*/

Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');
