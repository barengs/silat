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

        $this->command->info('✅ Default admin users created:');
        $this->command->table(
            ['Email', 'Password', 'Role'],
            [
                ['superadmin@disdik.pamekasan.go.id', 'password', 'super-admin'],
                ['resepsionis@disdik.pamekasan.go.id', 'password', 'resepsionis'],
            ]
        );
    }
}
