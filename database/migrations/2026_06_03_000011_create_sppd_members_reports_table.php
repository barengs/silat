<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // SPPD anggota rombongan (selain pemohon utama)
        Schema::create('sppd_members', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('sppd_id');
            $table->unsignedBigInteger('user_id');
            $table->string('role_in_trip')->nullable()->comment('Peran dalam perjalanan: Anggota, Sopir, dll');
            $table->timestamps();

            $table->foreign('sppd_id')->references('id')->on('sppds')->cascadeOnDelete();
            $table->foreign('user_id')->references('id')->on('users')->restrictOnDelete();
            $table->unique(['sppd_id', 'user_id']);
        });

        // Laporan Perjalanan Dinas (LPP)
        Schema::create('sppd_reports', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('sppd_id');
            $table->date('real_start_date')->nullable();
            $table->date('real_end_date')->nullable();
            $table->text('report_text')->comment('Isi laporan perjalanan');
            $table->string('attachment_proof')->nullable()
                  ->comment('Path zip/folder berisi foto, tiket, kwitansi');
            $table->decimal('actual_cost', 15, 2)->nullable();
            $table->text('notes')->nullable();
            $table->unsignedBigInteger('submitted_by');
            $table->timestamp('submitted_at')->nullable();
            $table->timestamps();

            $table->foreign('sppd_id')->references('id')->on('sppds')->cascadeOnDelete();
            $table->foreign('submitted_by')->references('id')->on('users');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sppd_reports');
        Schema::dropIfExists('sppd_members');
    }
};
