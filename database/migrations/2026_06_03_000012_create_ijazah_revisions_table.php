<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ijazah_revisions', function (Blueprint $table) {
            $table->id();
            // Auto-generated tracking ticket: IJZ-20260603-001
            $table->string('ticket_number', 30)->unique()
                  ->comment('Nomor tiket unik untuk pelacakan pengajuan');
            $table->unsignedBigInteger('institution_id')
                  ->comment('Sekolah asal pengajuan');
            // Student data
            $table->string('student_name');
            $table->string('nisn', 20)->nullable();
            $table->year('graduation_year');
            $table->enum('education_level', ['SD', 'SMP', 'SMA', 'SMK', 'TK', 'SLB'])
                  ->nullable();
            // Error description
            $table->text('wrong_data_description')
                  ->comment('Data yang salah (nama, TTL, ortu, dll)');
            $table->text('correct_data_description')
                  ->comment('Data yang benar sesuai dokumen pendukung');
            // Uploaded supporting documents
            $table->string('file_ijazah_wrong')->nullable()
                  ->comment('Scan ijazah yang salah');
            $table->string('file_akte')->nullable()
                  ->comment('Scan akte kelahiran');
            $table->string('file_kk')->nullable()
                  ->comment('Scan Kartu Keluarga');
            $table->string('file_sptjm')->nullable()
                  ->comment('Surat Pernyataan Tanggung Jawab Mutlak');
            $table->string('file_additional')->nullable()
                  ->comment('Dokumen pendukung tambahan (opsional)');
            // Workflow status
            $table->enum('status', [
                'draft',            // Baru dibuat, belum submit
                'submitted',        // Sudah dikirim, menunggu verifikasi
                'verifikasi',       // Sedang diperiksa verifikator
                'revisi',           // Dikembalikan untuk perbaikan
                'approved',         // Disetujui Kabid/Kadis
                'ready_for_pickup', // Siap diambil di loket
                'finished'          // Sudah diambil/selesai
            ])->default('draft');
            $table->integer('current_step')->default(0);
            $table->text('verifier_note')->nullable();
            // Who submitted
            $table->unsignedBigInteger('submitted_by')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('pickup_notified_at')->nullable()
                  ->comment('Kapan notifikasi pengambilan dikirim');
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('institution_id')->references('id')->on('institutions');
            $table->foreign('submitted_by')->references('id')->on('users')->nullOnDelete();

            $table->index('status');
            $table->index('ticket_number');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ijazah_revisions');
    }
};
