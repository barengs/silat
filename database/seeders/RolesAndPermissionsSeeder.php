<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // ── Define all permissions ─────────────────────────────────────────────
        $permissions = [
            // Dashboard
            'dashboard.view',

            // User management
            'users.view', 'users.create', 'users.edit', 'users.delete',
            'users.toggle-active', 'users.assign-role',

            // Role & Permission management
            'roles.view', 'roles.create', 'roles.edit', 'roles.delete',
            'permissions.view', 'permissions.assign',

            // Institution management
            'institutions.view', 'institutions.create', 'institutions.edit', 'institutions.delete',

            // Division management
            'divisions.view', 'divisions.create', 'divisions.edit', 'divisions.delete',

            // System settings
            'settings.view', 'settings.edit',
            'signatures.view', 'signatures.upload',

            // Approval flow configuration
            'approval-flows.view', 'approval-flows.edit',

            // Guest Book
            'guest-book.view', 'guest-book.create', 'guest-book.report',

            // SPPD
            'sppd.view-own', 'sppd.view-all',
            'sppd.create', 'sppd.edit', 'sppd.delete',
            'sppd.submit', 'sppd.verify', 'sppd.approve', 'sppd.reject',
            'sppd.report-upload', 'sppd.print',

            // Ijazah Revision
            'ijazah.view-own', 'ijazah.view-all',
            'ijazah.create', 'ijazah.edit', 'ijazah.delete',
            'ijazah.submit', 'ijazah.verify', 'ijazah.approve', 'ijazah.reject',
            'ijazah.notify-pickup',

            // Treasurer Change
            'treasurer.view-own', 'treasurer.view-all',
            'treasurer.create', 'treasurer.edit', 'treasurer.delete',
            'treasurer.submit', 'treasurer.verify', 'treasurer.approve', 'treasurer.reject',
            'treasurer.generate-letter', 'treasurer.download',

            // Articles / CMS
            'articles.view', 'articles.create', 'articles.edit', 'articles.delete',
            'articles.publish', 'article-categories.manage',

            // Reports & Analytics
            'reports.guest-book', 'reports.sppd', 'reports.ijazah', 'reports.treasurer',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'api']);
        }

        // ── Define roles and assign permissions ────────────────────────────────

        // 1. Super Admin — unrestricted access (handled via gate-before in AuthServiceProvider)
        Role::firstOrCreate(['name' => 'super-admin', 'guard_name' => 'api']);

        // 2. Resepsionis — only guest book
        Role::firstOrCreate(['name' => 'resepsionis', 'guard_name' => 'api'])
            ->syncPermissions([
                'dashboard.view',
                'guest-book.view', 'guest-book.create',
            ]);

        // 3. Verifikator — verify submissions from all modules
        Role::firstOrCreate(['name' => 'verifikator', 'guard_name' => 'api'])
            ->syncPermissions([
                'dashboard.view',
                'sppd.view-all', 'sppd.verify', 'sppd.reject',
                'ijazah.view-all', 'ijazah.verify', 'ijazah.reject',
                'treasurer.view-all', 'treasurer.verify', 'treasurer.reject',
                'reports.sppd', 'reports.ijazah', 'reports.treasurer',
            ]);

        // 4. Approver (Kepala Bidang / Sekretaris / Kepala Dinas)
        Role::firstOrCreate(['name' => 'approver', 'guard_name' => 'api'])
            ->syncPermissions([
                'dashboard.view',
                'sppd.view-all', 'sppd.approve', 'sppd.reject', 'sppd.print',
                'ijazah.view-all', 'ijazah.approve', 'ijazah.reject', 'ijazah.notify-pickup',
                'treasurer.view-all', 'treasurer.approve', 'treasurer.reject',
                'treasurer.generate-letter', 'treasurer.download',
                'reports.sppd', 'reports.ijazah', 'reports.treasurer',
                'signatures.view', 'signatures.upload',
            ]);

        // 5. Humas / Pengelola Konten
        Role::firstOrCreate(['name' => 'humas', 'guard_name' => 'api'])
            ->syncPermissions([
                'dashboard.view',
                'articles.view', 'articles.create', 'articles.edit',
                'articles.delete', 'articles.publish',
                'article-categories.manage',
            ]);

        // 6. Operator Sekolah — manage own school's submissions
        Role::firstOrCreate(['name' => 'operator-sekolah', 'guard_name' => 'api'])
            ->syncPermissions([
                'dashboard.view',
                'sppd.view-own', 'sppd.create', 'sppd.edit', 'sppd.submit', 'sppd.report-upload',
                'ijazah.view-own', 'ijazah.create', 'ijazah.edit', 'ijazah.submit',
                'treasurer.view-own', 'treasurer.create', 'treasurer.edit',
                'treasurer.submit', 'treasurer.download',
            ]);

        // 7. Kepala Sekolah — school-level approval before forwarding to dinas
        Role::firstOrCreate(['name' => 'kepala-sekolah', 'guard_name' => 'api'])
            ->syncPermissions([
                'dashboard.view',
                'sppd.view-own', 'sppd.approve',
                'ijazah.view-own', 'ijazah.approve',
                'treasurer.view-own', 'treasurer.approve',
            ]);

        // 8. Admin Dinas — user and institution management (no super admin level)
        Role::firstOrCreate(['name' => 'admin-dinas', 'guard_name' => 'api'])
            ->syncPermissions([
                'dashboard.view',
                'users.view', 'users.create', 'users.edit', 'users.toggle-active',
                'institutions.view', 'institutions.create', 'institutions.edit',
                'divisions.view',
                'reports.guest-book', 'reports.sppd', 'reports.ijazah', 'reports.treasurer',
                'guest-book.view', 'guest-book.report',
            ]);
    }
}
