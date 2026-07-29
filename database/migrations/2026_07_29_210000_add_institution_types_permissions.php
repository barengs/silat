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

        // Create new permissions
        Permission::firstOrCreate(['name' => 'institution-types.view', 'guard_name' => 'api']);
        Permission::firstOrCreate(['name' => 'institution-types.create', 'guard_name' => 'api']);
        Permission::firstOrCreate(['name' => 'institution-types.edit', 'guard_name' => 'api']);
        Permission::firstOrCreate(['name' => 'institution-types.delete', 'guard_name' => 'api']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        Permission::whereIn('name', [
            'institution-types.view',
            'institution-types.create',
            'institution-types.edit',
            'institution-types.delete',
        ])->where('guard_name', 'api')->delete();
    }
};
