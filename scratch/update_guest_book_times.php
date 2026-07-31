<?php

use App\Models\GuestBook;
use Carbon\Carbon;

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

foreach (GuestBook::all() as $gb) {
    if ($gb->check_in_time) {
        $gb->check_in_time = Carbon::parse($gb->check_in_time)->addHours(7)->format('H:i:s');
    }
    if ($gb->check_out_time) {
        $gb->check_out_time = Carbon::parse($gb->check_out_time)->addHours(7)->format('H:i:s');
    }
    $gb->save();
}

echo "Done\n";
