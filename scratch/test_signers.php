<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;

$signers = User::where('is_active', true)
    ->where(function ($query) {
        $query->permission('signatures.upload')
            ->orWhereHas('roles', function ($q) {
                $q->where('name', 'super-admin');
            });
    })
    ->with('roles:id,name')
    ->get();

foreach ($signers as $signer) {
    echo "ID: {$signer->id}, Name: {$signer->name}, Roles: " . implode(', ', $signer->roles->pluck('name')->toArray()) . "\n";
}
