<?php

namespace Database\Seeders;

use App\Models\Division;
use Illuminate\Database\Seeder;

class DivisionSeeder extends Seeder
{
    public function run(): void
    {
        $divisions = [
            [
                'name' => 'Sekretariat',
                'code' => 'SEKRETARIAT',
                'description' => 'Sekretariat Dinas Pendidikan',
                'sort_order' => 1,
                'children' => [
                    ['name' => 'Sub Bagian Umum & Kepegawaian', 'code' => 'SUBBAG-UMUM',      'sort_order' => 1],
                    ['name' => 'Sub Bagian Keuangan & Aset',    'code' => 'SUBBAG-KEUANGAN',   'sort_order' => 2],
                    ['name' => 'Sub Bagian Perencanaan & Evaluasi', 'code' => 'SUBBAG-RENBANG', 'sort_order' => 3],
                ],
            ],
            [
                'name' => 'Bidang Pembinaan Pendidikan Anak Usia Dini & Pendidikan Non Formal',
                'code' => 'BIDANG-PAUD-PNF',
                'description' => 'Bidang PAUD dan Pendidikan Non Formal',
                'sort_order' => 2,
                'children' => [
                    ['name' => 'Seksi Kurikulum PAUD & PNF',    'code' => 'SEKSI-KURIK-PAUD', 'sort_order' => 1],
                    ['name' => 'Seksi Kelembagaan PAUD & PNF',  'code' => 'SEKSI-LEMB-PAUD',  'sort_order' => 2],
                ],
            ],
            [
                'name' => 'Bidang Pembinaan Sekolah Dasar',
                'code' => 'BIDANG-SD',
                'description' => 'Bidang Pembinaan Pendidikan Sekolah Dasar',
                'sort_order' => 3,
                'children' => [
                    ['name' => 'Seksi Kurikulum SD',     'code' => 'SEKSI-KURIK-SD',  'sort_order' => 1],
                    ['name' => 'Seksi Kelembagaan SD',   'code' => 'SEKSI-LEMB-SD',   'sort_order' => 2],
                    ['name' => 'Seksi Kesiswaan SD',     'code' => 'SEKSI-SISWA-SD',  'sort_order' => 3],
                ],
            ],
            [
                'name' => 'Bidang Pembinaan Sekolah Menengah Pertama',
                'code' => 'BIDANG-SMP',
                'description' => 'Bidang Pembinaan Pendidikan Sekolah Menengah Pertama',
                'sort_order' => 4,
                'children' => [
                    ['name' => 'Seksi Kurikulum SMP',    'code' => 'SEKSI-KURIK-SMP', 'sort_order' => 1],
                    ['name' => 'Seksi Kelembagaan SMP',  'code' => 'SEKSI-LEMB-SMP',  'sort_order' => 2],
                    ['name' => 'Seksi Kesiswaan SMP',    'code' => 'SEKSI-SISWA-SMP', 'sort_order' => 3],
                ],
            ],
            [
                'name' => 'Bidang GTK (Guru & Tenaga Kependidikan)',
                'code' => 'BIDANG-GTK',
                'description' => 'Bidang Guru dan Tenaga Kependidikan',
                'sort_order' => 5,
                'children' => [
                    ['name' => 'Seksi PTK PAUD & SD',    'code' => 'SEKSI-PTK-PAUD', 'sort_order' => 1],
                    ['name' => 'Seksi PTK SMP',          'code' => 'SEKSI-PTK-SMP',  'sort_order' => 2],
                ],
            ],
        ];

        foreach ($divisions as $divData) {
            $children = $divData['children'] ?? [];
            unset($divData['children']);

            $parent = Division::firstOrCreate(['code' => $divData['code']], $divData);

            foreach ($children as $child) {
                Division::firstOrCreate(
                    ['code' => $child['code']],
                    array_merge($child, ['parent_id' => $parent->id])
                );
            }
        }
    }
}
