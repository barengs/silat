<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('treasurer_changes', function (Blueprint $table) {
            $table->id();
            $table->string('reference_number', 50)->nullable()->unique()
                  ->comment('Nomor referensi pengajuan, auto-generated');
            $table->unsignedBigInteger('institution_id')
                  ->comment('Sekolah pengaju');
            // Old treasurer data
            $table->string('old_treasurer_name');
            $table->string('old_bank_account', 30)->nullable();
            $table->string('old_npwp', 20)->nullable();
            // New treasurer data
            $table->string('new_treasurer_name');
            $table->string('new_bank_account', 30)->nullable();
            $table->string('new_npwp', 20)->nullable();
            $table->string('bank_name')->nullable()->comment('Nama bank: BRI, BNI, Bank Jatim, dll');
            $table->string('bank_branch')->nullable()->comment('Cabang bank');
            $table->enum('change_type', ['bendahara', 'rekening', 'both'])->default('both')
                  ->comment('Jenis perubahan: hanya bendahara, hanya rekening, atau keduanya');
            // Required documents
            $table->string('file_sk_kepsek')->nullable()
                  ->comment('SK Kepala Sekolah tentang penunjukan bendahara baru');
            $table->string('file_ktp_npwp')->nullable()
                  ->comment('KTP dan NPWP bendahara baru');
            $table->string('file_additional')->nullable();
            // Workflow
            $table->enum('status', [
                'draft',
                'submitted',
                'verifikasi',
                'revisi',
                'approved',
                'ready_to_print', // PDF rekomendasi sudah dibuat, siap didownload
                'completed'       // Sudah diunduh dan diserahkan ke bank
            ])->default('draft');
            $table->integer('current_step')->default(0);
            $table->text('verifier_note')->nullable();
            // Final generated recommendation PDF
            $table->string('recommendation_letter_path')->nullable()
                  ->comment('Path file PDF Surat Rekomendasi untuk Bank');
            $table->unsignedBigInteger('submitted_by')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('document_generated_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('institution_id')->references('id')->on('institutions');
            $table->foreign('submitted_by')->references('id')->on('users')->nullOnDelete();

            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('treasurer_changes');
    }
};
