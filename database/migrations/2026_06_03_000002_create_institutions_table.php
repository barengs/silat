<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('institutions', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['dinas', 'sekolah', 'external'])->default('sekolah');
            $table->string('name');
            $table->string('npsn_code')->nullable()->unique()->comment('NPSN untuk sekolah');
            $table->string('nss_code')->nullable()->comment('NSS untuk sekolah');
            $table->enum('school_level', ['SD', 'SMP', 'SMA', 'SMK', 'TK', 'SLB'])->nullable();
            $table->string('address')->nullable();
            $table->string('village')->nullable()->comment('Kelurahan/Desa');
            $table->string('district')->nullable()->comment('Kecamatan');
            $table->string('city')->nullable()->default('Pamekasan');
            $table->string('province')->nullable()->default('Jawa Timur');
            $table->string('postal_code', 10)->nullable();
            $table->string('phone', 20)->nullable();
            $table->string('email')->nullable();
            $table->string('principal_name')->nullable()->comment('Nama Kepala Sekolah');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('institutions');
    }
};
