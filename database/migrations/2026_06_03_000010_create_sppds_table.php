<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sppds', function (Blueprint $table) {
            $table->id();
            // Official SPPD document number (format: 090/123/432.401/2026)
            $table->string('document_number', 100)->nullable()->unique()
                  ->comment('Nomor dokumen SPPD resmi, null saat masih draft');
            // Requester — the main officer/employee going on duty travel
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('institution_id')->nullable()
                  ->comment('Institusi pengaju (untuk SPPD sekolah)');
            $table->text('destination')->comment('Tujuan perjalanan');
            $table->text('purpose')->comment('Maksud dan tujuan perjalanan dinas');
            $table->string('base_letter')->nullable()->comment('Dasar surat/SK');
            $table->date('start_date');
            $table->date('end_date');
            $table->unsignedBigInteger('transport_type_id')->nullable();
            $table->string('budget_source')->nullable()->comment('Sumber anggaran: APBD, BOS, dll');
            $table->decimal('estimated_budget', 15, 2)->nullable();
            $table->decimal('actual_budget', 15, 2)->nullable();
            $table->enum('status', [
                'draft',         // Baru dibuat
                'submitted',     // Sudah disubmit, menunggu verifikasi
                'verifikasi',    // Sedang diverifikasi
                'approved',      // Disetujui, menunggu keberangkatan
                'active',        // Sedang dalam perjalanan
                'reported',      // Sudah lapor/upload LPP
                'closed',        // Selesai & ditutup
                'rejected'       // Ditolak
            ])->default('draft');
            $table->integer('current_step')->default(0)
                  ->comment('Langkah approval saat ini');
            $table->string('document_path')->nullable()
                  ->comment('Path file PDF SPPD yang sudah disetujui');
            $table->text('rejection_note')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('user_id')->references('id')->on('users')->restrictOnDelete();
            $table->foreign('institution_id')->references('id')->on('institutions')->nullOnDelete();
            $table->foreign('transport_type_id')->references('id')->on('transport_types')->nullOnDelete();

            $table->index('status');
            $table->index(['user_id', 'start_date', 'end_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sppds');
    }
};
