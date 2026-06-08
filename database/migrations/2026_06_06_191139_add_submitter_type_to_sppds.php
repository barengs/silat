<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sppds', function (Blueprint $table) {
            // 'sekolah' = pengaju dari operator sekolah → melalui verifikasi admin dulu
            // 'dinas'   = pengaju dari staff/operator dinas → langsung ke Kabid
            $table->enum('submitter_type', ['sekolah', 'dinas'])
                ->default('sekolah')
                ->after('institution_id')
                ->comment('Jenis pengaju: sekolah atau staff dinas — menentukan jalur alur persetujuan');
        });
    }

    public function down(): void
    {
        Schema::table('sppds', function (Blueprint $table) {
            $table->dropColumn('submitter_type');
        });
    }
};
