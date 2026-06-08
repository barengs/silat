<?php

namespace App\Imports;

use App\Models\Institution;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithStartRow;

class InstitutionImport implements ToCollection, WithStartRow
{
    public $importedCount = 0;

    public function startRow(): int
    {
        return 2; // Skip header
    }

    public function collection(Collection $rows)
    {
        foreach ($rows as $row) {
            $name = trim($row[0] ?? '');
            $type = trim($row[1] ?? '');
            $npsn = trim($row[2] ?? '');
            $city = trim($row[3] ?? '');

            if (empty($name) || empty($type)) continue;

            // Map frontend type to database type and school_level
            $dbType = 'sekolah';
            $schoolLevel = null;
            if ($type === 'sekolah_sma') {
                $dbType = 'sekolah';
                $schoolLevel = 'SMA';
            } elseif ($type === 'sekolah_smk') {
                $dbType = 'sekolah';
                $schoolLevel = 'SMK';
            } elseif ($type === 'sekolah_pkplk') {
                $dbType = 'sekolah';
                $schoolLevel = 'SLB';
            } elseif ($type === 'dinas') {
                $dbType = 'dinas';
                $schoolLevel = null;
            } else {
                $dbType = 'external';
                $schoolLevel = null;
            }

            Institution::updateOrCreate(
                ['name' => $name],
                [
                    'type' => $dbType,
                    'school_level' => $schoolLevel,
                    'npsn_code' => $npsn ?: null,
                    'city' => $city ?: null,
                    'is_active' => true,
                ]
            );
            $this->importedCount++;
        }
    }
}
