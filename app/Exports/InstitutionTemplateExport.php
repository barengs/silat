<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;

class InstitutionTemplateExport implements FromArray, WithHeadings
{
    public function array(): array
    {
        return [
            ['SMAN 1 Pamekasan', 'sekolah_sma', '20527341', 'Pamekasan']
        ];
    }

    public function headings(): array
    {
        return [
            'Nama Instansi',
            'Tipe (dinas/cabdin/sekolah_sma/sekolah_smk/sekolah_pkplk/other)',
            'NPSN',
            'Kota/Kab'
        ];
    }
}
