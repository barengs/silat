<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('approval_flows', function (Blueprint $table) {
            $table->id();
            $table->enum('module_name', ['sppd', 'ijazah', 'bendahara'])
                ->comment('Modul yang menggunakan alur persetujuan ini');
            $table->integer('step_order')->comment('Urutan langkah, dimulai dari 1');
            $table->string('step_label')->comment('Label langkah, misal: Verifikasi Berkas, Persetujuan Kabid');
            $table->unsignedBigInteger('role_id_required')
                ->comment('Role yang dibutuhkan untuk melakukan aksi di langkah ini');
            $table->enum('action_type', ['verify', 'approve', 'reject', 'forward'])
                ->default('approve');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            // Note: roles table is created by Spatie Permission migration.
            // We add the FK constraint via a separate migration after seeding.
            $table->index('role_id_required');

            // Prevent duplicate step order per module
            $table->unique(['module_name', 'step_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('approval_flows');
    }
};
