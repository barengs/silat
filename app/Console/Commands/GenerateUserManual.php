<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\File;

class GenerateUserManual extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'simtag:generate-manual';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate the SIMTAG User Manual in PDF format with embedded base64 screenshots';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Memulai kompilasi PDF Panduan Pengguna SIMTAG...');

        // Lokasi direktori gambar manual di public/images/manual
        $publicDir = public_path('images/manual/');
        
        $imageNames = [
            'login' => 'login.png',
            'lock_screen' => 'lock_screen.png',
            'dashboard' => 'dashboard.png',
            'guest_book' => 'guest_book.png',
            'sppd' => 'sppd.png',
            'ijazah' => 'ijazah.png',
            'pindah_sekolah' => 'pindah_sekolah.png',
            'pindah_sekolah_form' => 'pindah_sekolah_form.png',
            'verifikasi' => 'verifikasi.png',
            'signatures' => 'signatures.png',
        ];

        $images = [];

        foreach ($imageNames as $key => $filename) {
            $path = $publicDir . $filename;
            if (file_exists($path)) {
                $images[$key] = base64_encode(file_get_contents($path));
                $this->line("Berhasil memproses & encode: {$filename}");
            } else {
                $images[$key] = '';
                $this->warn("PERINGATAN: File gambar tidak ditemukan: {$filename}");
            }
        }

        $this->info('Me-render view template pdf.user_manual...');

        // Memuat view blade PDF dan menyematkan data base64 gambar
        $pdf = Pdf::loadView('pdf.user_manual', compact('images'));

        // Mengatur opsi DomPDF jika diperlukan
        $pdf->setPaper('a4', 'portrait');

        // Menulis output ke file public
        $outputPathPublic = public_path('user_manual_simtag.pdf');
        File::put($outputPathPublic, $pdf->output());
        $this->info("PDF berhasil disimpan ke folder public: {$outputPathPublic}");

        // Memastikan folder storage public siap
        $storageDir = storage_path('app/public');
        if (!is_dir($storageDir)) {
            mkdir($storageDir, 0777, true);
        }
        $outputPathStorage = $storageDir . '/user_manual_simtag.pdf';
        File::put($outputPathStorage, $pdf->output());
        $this->info("PDF berhasil disalin ke folder storage: {$outputPathStorage}");

        $this->info('Selesai! Panduan Pengguna SIMTAG berhasil dibuat.');
    }
}
