<?php

namespace Database\Seeders;

use App\Models\SystemSetting;
use Illuminate\Database\Seeder;

class SystemSettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            // General
            ['setting_key' => 'app_name',          'setting_value' => 'SIMTAG Disdik Pamekasan', 'type' => 'string',  'label' => 'Nama Aplikasi',          'group' => 'general'],
            ['setting_key' => 'app_tagline',        'setting_value' => 'Sistem Manajemen Tata Kelola Terpadu', 'type' => 'string', 'label' => 'Tagline Aplikasi', 'group' => 'general'],
            ['setting_key' => 'app_logo',           'setting_value' => null,                       'type' => 'file',    'label' => 'Logo Aplikasi',          'group' => 'general'],
            ['setting_key' => 'app_favicon',        'setting_value' => null,                       'type' => 'file',    'label' => 'Favicon',                'group' => 'general'],
            ['setting_key' => 'primary_color',      'setting_value' => '#1e40af',                  'type' => 'string',  'label' => 'Warna Utama',            'group' => 'general'],

            // Organization
            ['setting_key' => 'dinas_name',         'setting_value' => 'Dinas Pendidikan Kabupaten Pamekasan', 'type' => 'string', 'label' => 'Nama Dinas', 'group' => 'organization'],
            ['setting_key' => 'dinas_address',      'setting_value' => 'Jl. Jokotole No. 117, Pamekasan, Madura 69317', 'type' => 'text', 'label' => 'Alamat Kantor', 'group' => 'organization'],
            ['setting_key' => 'dinas_phone',        'setting_value' => '(0324) 321234',            'type' => 'string',  'label' => 'Telepon Kantor',         'group' => 'organization'],
            ['setting_key' => 'dinas_email',        'setting_value' => 'disdik@pamekasankab.go.id', 'type' => 'string', 'label' => 'Email Kantor',           'group' => 'organization'],
            ['setting_key' => 'dinas_website',      'setting_value' => 'https://disdik.pamekasankab.go.id', 'type' => 'string', 'label' => 'Website',        'group' => 'organization'],
            ['setting_key' => 'dinas_logo',         'setting_value' => null,                       'type' => 'file',    'label' => 'Logo Dinas',             'group' => 'organization'],
            ['setting_key' => 'kabupaten_logo',     'setting_value' => null,                       'type' => 'file',    'label' => 'Logo Kabupaten',         'group' => 'organization'],
            ['setting_key' => 'kepala_dinas_name',  'setting_value' => '',                         'type' => 'string',  'label' => 'Nama Kepala Dinas',      'group' => 'organization'],
            ['setting_key' => 'kepala_dinas_nip',   'setting_value' => '',                         'type' => 'string',  'label' => 'NIP Kepala Dinas',       'group' => 'organization'],

            // Work Hours
            ['setting_key' => 'office_hours_start', 'setting_value' => '07:30',                   'type' => 'string',  'label' => 'Jam Masuk Kantor',       'group' => 'office'],
            ['setting_key' => 'office_hours_end',   'setting_value' => '16:00',                   'type' => 'string',  'label' => 'Jam Pulang Kantor',      'group' => 'office'],

            // SPPD Settings
            ['setting_key' => 'sppd_number_prefix', 'setting_value' => '090',                     'type' => 'string',  'label' => 'Prefiks Nomor SPPD',     'group' => 'sppd'],
            ['setting_key' => 'sppd_office_code',   'setting_value' => '432.401',                 'type' => 'string',  'label' => 'Kode Kantor untuk SPPD', 'group' => 'sppd'],

            // Notification
            ['setting_key' => 'notif_email_enabled','setting_value' => '1',                       'type' => 'boolean', 'label' => 'Notifikasi Email Aktif', 'group' => 'notification'],
            ['setting_key' => 'support_contact',    'setting_value' => '',                        'type' => 'string',  'label' => 'Kontak Bantuan (HP/WA)', 'group' => 'notification'],

            // QR Verification
            ['setting_key' => 'qr_verify_base_url', 'setting_value' => '/verify/doc',             'type' => 'string',  'label' => 'Base URL Verifikasi QR', 'group' => 'qr'],
        ];

        foreach ($settings as $setting) {
            SystemSetting::firstOrCreate(
                ['setting_key' => $setting['setting_key']],
                $setting
            );
        }
    }
}
