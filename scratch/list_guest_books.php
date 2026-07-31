<?php

use App\Models\GuestBook;

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

foreach (GuestBook::orderBy('date', 'desc')->orderBy('check_in_time', 'desc')->get() as $g) {
    echo "ID: {$g->id}, Date: {$g->date}, CheckIn: {$g->check_in_time}, CreatedAt: {$g->created_at}\n";
}
