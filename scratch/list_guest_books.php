<?php

use App\Models\GuestBook;
use Illuminate\Support\Facades\DB;

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Default connection: " . DB::getDefaultConnection() . "\n";
echo "Database: " . DB::connection()->getDatabaseName() . "\n";
echo "Total GuestBook count: " . GuestBook::count() . "\n";

foreach (GuestBook::orderBy('created_at', 'desc')->get() as $g) {
    echo "ID: {$g->id}, Date: {$g->date}, CheckIn: {$g->check_in_time}, CreatedAt: {$g->created_at}\n";
}
