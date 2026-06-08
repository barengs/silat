<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;

class DivisionTemplateExport implements FromArray, WithHeadings
{
    public function array(): array
    {
        return [
            ['Bidang Pembinaan SMA', 'SMA-01', 'Mengurus SMA', '1']
        ];
    }

    public function headings(): array
    {
        return [
            'Nama Divisi/Bidang',
            'Kode',
            'Deskripsi',
            'Urutan'
        ];
    }
}
