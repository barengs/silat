<?php

namespace Database\Seeders;

use App\Models\Institution;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        // Create the Dinas institution (type: dinas)
        $dinas = Institution::firstOrCreate(
            ['type' => 'dinas'],
            [
                'name' => 'Dinas Pendidikan Kabupaten Pamekasan',
                'address' => 'Jl. Jokotole No. 117, Pamekasan',
                'city' => 'Pamekasan',
                'province' => 'Jawa Timur',
                'phone' => '(0324) 321234',
                'email' => 'disdik@pamekasankab.go.id',
                'is_active' => true,
            ]
        );

        // Create Super Admin user
        $superAdmin = User::firstOrCreate(
            ['email' => 'superadmin@disdik.pamekasan.go.id'],
            [
                'name' => 'Super Administrator',
                'email' => 'superadmin@disdik.pamekasan.go.id',
                'password' => Hash::make('password'),
                'institution_id' => $dinas->id,
                'is_active' => true,
            ]
        );
        $superAdmin->assignRole('super-admin');

        // Create a default Resepsionis account for testing
        $resepsionis = User::firstOrCreate(
            ['email' => 'resepsionis@disdik.pamekasan.go.id'],
            [
                'name' => 'Resepsionis Dinas',
                'email' => 'resepsionis@disdik.pamekasan.go.id',
                'password' => Hash::make('password'),
                'institution_id' => $dinas->id,
                'is_active' => true,
            ]
        );
        $resepsionis->assignRole('resepsionis');

        // Create Kasi (Verifikator)
        $kasi = User::firstOrCreate(
            ['email' => 'kasi@disdik.pamekasan.go.id'],
            [
                'name' => 'Kasi Ketenagaan',
                'email' => 'kasi@disdik.pamekasan.go.id',
                'password' => Hash::make('password'),
                'institution_id' => $dinas->id,
                'is_active' => true,
            ]
        );
        $kasi->assignRole('verifikator');

        // Create Kabid (Kepala Bidang)
        $kabid = User::firstOrCreate(
            ['email' => 'kabid@disdik.pamekasan.go.id'],
            [
                'name' => 'Kabid Pembinaan SMA',
                'email' => 'kabid@disdik.pamekasan.go.id',
                'password' => Hash::make('password'),
                'institution_id' => $dinas->id,
                'is_active' => true,
            ]
        );
        $kabid->assignRole('kabid');

        // Create Kadis (Kepala Dinas)
        $kadis = User::firstOrCreate(
            ['email' => 'kadis@disdik.pamekasan.go.id'],
            [
                'name' => 'Kadis Pendidikan',
                'email' => 'kadis@disdik.pamekasan.go.id',
                'password' => Hash::make('password'),
                'institution_id' => $dinas->id,
                'is_active' => true,
            ]
        );
        $kadis->assignRole('kadis');

        // Create Staff Admin Disdik (Admin Dinas)
        $adminDinas = User::firstOrCreate(
            ['email' => 'admin.dinas@disdik.pamekasan.go.id'],
            [
                'name' => 'Staff Admin Disdik',
                'email' => 'admin.dinas@disdik.pamekasan.go.id',
                'password' => Hash::make('password'),
                'institution_id' => $dinas->id,
                'is_active' => true,
            ]
        );
        $adminDinas->assignRole('admin-dinas');

        // Create a sample school (SMAN 1 Pamekasan)
        $school = Institution::firstOrCreate(
            ['npsn_code' => '20524422'],
            [
                'type' => 'sekolah',
                'name' => 'SMAN 1 Pamekasan',
                'nss_code' => '301052801001',
                'school_level' => 'SMA',
                'address' => 'Jl. SMAN 1 Pamekasan No. 1',
                'city' => 'Pamekasan',
                'province' => 'Jawa Timur',
                'phone' => '(0324) 333444',
                'email' => 'sman1@sekolah.pamekasan.go.id',
                'principal_name' => 'Drs. H. Sukarno, M.Pd.',
                'is_active' => true,
            ]
        );

        // Create Admin Sekolah (Operator Sekolah)
        $operatorSekolah = User::firstOrCreate(
            ['email' => 'operator.sma1@sekolah.pamekasan.go.id'],
            [
                'name' => 'Operator SMAN 1 Pamekasan',
                'email' => 'operator.sma1@sekolah.pamekasan.go.id',
                'password' => Hash::make('password'),
                'institution_id' => $school->id,
                'is_active' => true,
            ]
        );
        $operatorSekolah->assignRole('operator-sekolah');

        // Create Kepsek (Kepala Sekolah)
        $kepalaSekolah = User::firstOrCreate(
            ['email' => 'kepsek.sma1@sekolah.pamekasan.go.id'],
            [
                'name' => 'Kepala SMAN 1 Pamekasan',
                'email' => 'kepsek.sma1@sekolah.pamekasan.go.id',
                'password' => Hash::make('password'),
                'institution_id' => $school->id,
                'is_active' => true,
            ]
        );
        $kepalaSekolah->assignRole('kepala-sekolah');

        $this->command->info('✅ Default admin users created:');
        $this->command->table(
            ['Email', 'Password', 'Role'],
            [
                ['superadmin@disdik.pamekasan.go.id', 'password', 'super-admin'],
                ['resepsionis@disdik.pamekasan.go.id', 'password', 'resepsionis'],
                ['kasi@disdik.pamekasan.go.id', 'password', 'verifikator'],
                ['kabid@disdik.pamekasan.go.id', 'password', 'kabid'],
                ['kadis@disdik.pamekasan.go.id', 'password', 'kadis'],
                ['admin.dinas@disdik.pamekasan.go.id', 'password', 'admin-dinas'],
                ['operator.sma1@sekolah.pamekasan.go.id', 'password', 'operator-sekolah'],
                ['kepsek.sma1@sekolah.pamekasan.go.id', 'password', 'kepala-sekolah'],
            ]
        );
    }
}
