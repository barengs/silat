<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Institution;

echo "=== INSTITUTIONS ===\n";
foreach (Institution::all() as $inst) {
    echo "ID: " . $inst->id . ", Name: " . $inst->name . ", Type: " . $inst->type . "\n";
}
