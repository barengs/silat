<?php

namespace App\Imports;

use App\Models\Division;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithStartRow;

class DivisionImport implements ToCollection, WithStartRow
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
            $code = trim($row[1] ?? '');
            $description = trim($row[2] ?? '');
            $sortOrder = trim($row[3] ?? '');

            if (empty($name)) continue;

            Division::updateOrCreate(
                ['name' => $name],
                [
                    'code' => $code ?: null,
                    'description' => $description ?: null,
                    'sort_order' => is_numeric($sortOrder) ? (int)$sortOrder : 0,
                    'is_active' => true,
                ]
            );
            $this->importedCount++;
        }
    }
}
