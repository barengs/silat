<?php

use Illuminate\Database\Migrations\Migration;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // Create the new permissions
        Permission::firstOrCreate(['name' => 'guest-book.edit', 'guard_name' => 'api']);
        Permission::firstOrCreate(['name' => 'guest-book.delete', 'guard_name' => 'api']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        Permission::whereIn('name', ['guest-book.edit', 'guest-book.delete'])
            ->where('guard_name', 'api')
            ->delete();
    }
};
