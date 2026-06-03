<?php

namespace Database\Seeders;

use App\Models\TransportType;
use App\Models\ArticleCategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class MasterDataSeeder extends Seeder
{
    public function run(): void
    {
        // Transport Types
        $transportTypes = [
            ['name' => 'Kendaraan Dinas',   'icon' => 'car',          'description' => 'Kendaraan operasional milik dinas'],
            ['name' => 'Kendaraan Pribadi', 'icon' => 'car',          'description' => 'Kendaraan pribadi pegawai'],
            ['name' => 'Kendaraan Umum',    'icon' => 'bus',          'description' => 'Bus, angkot, atau transportasi umum darat'],
            ['name' => 'Transportasi Laut', 'icon' => 'ship',         'description' => 'Kapal laut / feri'],
            ['name' => 'Transportasi Udara','icon' => 'plane',        'description' => 'Pesawat terbang'],
            ['name' => 'Ojek / Taksi',      'icon' => 'bike',         'description' => 'Ojek online atau taksi'],
        ];

        foreach ($transportTypes as $type) {
            TransportType::firstOrCreate(['name' => $type['name']], $type);
        }

        // Article Categories
        $articleCategories = [
            ['name' => 'Berita Utama',       'color' => '#dc2626', 'icon' => 'newspaper',    'sort_order' => 1],
            ['name' => 'Pengumuman Penting', 'color' => '#ea580c', 'icon' => 'megaphone',    'sort_order' => 2],
            ['name' => 'Info BOS',           'color' => '#16a34a', 'icon' => 'banknote',     'sort_order' => 3],
            ['name' => 'Agenda & Kegiatan',  'color' => '#2563eb', 'icon' => 'calendar',     'sort_order' => 4],
            ['name' => 'Regulasi & Kebijakan','color' => '#7c3aed', 'icon' => 'file-text',   'sort_order' => 5],
            ['name' => 'Prestasi',           'color' => '#ca8a04', 'icon' => 'trophy',       'sort_order' => 6],
            ['name' => 'Informasi Umum',     'color' => '#0891b2', 'icon' => 'info',         'sort_order' => 7],
        ];

        foreach ($articleCategories as $cat) {
            ArticleCategory::firstOrCreate(
                ['name' => $cat['name']],
                array_merge($cat, ['slug' => Str::slug($cat['name'])])
            );
        }
    }
}
