<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('guest_agencies', function (Blueprint $table) {
            $table->id();
            $table->string('name')->comment('Nama instansi/lembaga tamu');
            $table->string('type')->nullable()->comment('Jenis: Pemerintah, Swasta, Sekolah, Masyarakat Umum');
            $table->string('city')->nullable();
            $table->integer('visit_count')->default(0)->comment('Counter kunjungan untuk analytics');
            $table->timestamps();

            // Ensure uniqueness to prevent duplicates in autocomplete
            $table->unique('name');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('guest_agencies');
    }
};
