<?php

namespace App\Imports;

use App\Models\Institution;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Hash;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Spatie\Permission\Models\Role;

class UsersImport implements ToCollection, WithHeadingRow
{
    public function collection(Collection $rows)
    {
        foreach ($rows as $row) {
            // Validasi minimal ada Nama dan NIP
            if (empty($row['nip']) || empty($row['nama'])) {
                continue;
            }

            // Cek apakah user sudah ada berdasarkan NIP
            $user = User::query()->where('nip', $row['nip'])->first();

            if (! $user) {
                $user = new User;
                // Password default adalah NIP
                $user->password = Hash::make((string) $row['nip']);
            }

            $user->name = $row['nama'];
            $user->nip = $row['nip'];

            // Email opsional, jika kosong gunakan format default
            $user->email = ! empty($row['email']) ? $row['email'] : $row['nip'].'@disdik.pamekasan.go.id';
            $user->is_active = true;

            // Handling Institution ID
            $institutionId = ! empty($row['id_instansi']) ? $row['id_instansi'] : null;
            if ($institutionId) {
                $inst = Institution::query()->find($institutionId);
                if ($inst) {
                    $user->institution_id = $inst->id;
                }
            }

            $user->save();

            // Handling Role (default: operator-sekolah)
            $roleName = ! empty($row['role']) ? $row['role'] : 'operator-sekolah';
            $role = Role::where('name', $roleName)->first();
            if ($role) {
                $user->syncRoles([$role]);
            }
        }
    }
}
