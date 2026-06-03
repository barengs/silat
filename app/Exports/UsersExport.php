<?php

namespace App\Exports;

use App\Models\User;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class UsersExport implements FromCollection, WithHeadings, WithMapping
{
    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
        // Get all users with their related roles and institution
        return User::with(['roles', 'institution'])->orderBy('name')->get();
    }

    /**
    * @return array
    */
    public function headings(): array
    {
        return [
            'ID',
            'Nama Lengkap',
            'NIP',
            'Email',
            'Instansi',
            'Roles',
            'Status Aktif'
        ];
    }

    /**
    * @param mixed $user
    * @return array
    */
    public function map($user): array
    {
        return [
            $user->id,
            $user->name,
            $user->nip,
            $user->email,
            $user->institution ? $user->institution->name : 'Dinas Pendidikan',
            $user->roles->pluck('name')->join(', '),
            $user->is_active ? 'Aktif' : 'Nonaktif'
        ];
    }
}
