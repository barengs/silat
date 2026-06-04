<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     * Order matters due to foreign key dependencies.
     */
    public function run(): void
    {
        $this->call([
            // 1. RBAC first — roles & permissions needed by user seeder
            RolesAndPermissionsSeeder::class,

            // 2. System config
            SystemSettingSeeder::class,

            // 3. Core master data
            DivisionSeeder::class,
            MasterDataSeeder::class,
            ApprovalFlowSeeder::class,

            // 4. Users (depends on institutions which is auto-created in AdminUserSeeder)
            AdminUserSeeder::class,
        ]);
    }
}
