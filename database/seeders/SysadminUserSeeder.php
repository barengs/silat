<?php

namespace Database\Seeders;

use App\Models\Institution;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SysadminUserSeeder extends Seeder
{
    public function run(): void
    {
        // Get or create the Dinas institution
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

        // Create Sysadmin user
        $sysadmin = User::updateOrCreate(
            ['email' => 'sysadmin@disdik.pamekasan.go.id'],
            [
                'name' => 'System Administrator',
                'password' => Hash::make('sysadmin123'),
                'institution_id' => $dinas->id,
                'is_active' => true,
            ]
        );
        $sysadmin->assignRole('super-admin');

        $this->command->info('✅ Sysadmin user created successfully:');
        $this->command->table(
            ['Email', 'Password', 'Role'],
            [
                ['sysadmin@disdik.pamekasan.go.id', 'sysadmin123', 'super-admin']
            ]
        );
    }
}
