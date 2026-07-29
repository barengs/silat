<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('institution_types', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->enum('group', ['dinas', 'sekolah', 'external'])->default('sekolah');
            $table->string('school_level', 10)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Seed default institution types
        $types = [
            ['name' => 'Dinas Pendidikan', 'code' => 'dinas',          'group' => 'dinas',    'school_level' => null,         'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Cabang Dinas',     'code' => 'cabdin',         'group' => 'external', 'school_level' => null,         'created_at' => now(), 'updated_at' => now()],
            ['name' => 'SMA',              'code' => 'sekolah_sma',    'group' => 'sekolah',  'school_level' => 'SMA',        'created_at' => now(), 'updated_at' => now()],
            ['name' => 'SMK',              'code' => 'sekolah_smk',    'group' => 'sekolah',  'school_level' => 'SMK',        'created_at' => now(), 'updated_at' => now()],
            ['name' => 'PKPLK',            'code' => 'sekolah_pkplk',  'group' => 'sekolah',  'school_level' => 'SLB',        'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Lainnya',          'code' => 'other',          'group' => 'external', 'school_level' => null,         'created_at' => now(), 'updated_at' => now()],
        ];
        DB::table('institution_types')->insert($types);

        // Add foreign key column to institutions table
        Schema::table('institutions', function (Blueprint $table) {
            $table->unsignedBigInteger('institution_type_id')->nullable()->after('type');
            $table->foreign('institution_type_id')->references('id')->on('institution_types')->nullOnDelete();
        });

        // Map existing institutions to the newly created types
        $dinasType = DB::table('institution_types')->where('code', 'dinas')->first();
        $smaType   = DB::table('institution_types')->where('code', 'sekolah_sma')->first();
        $smkType   = DB::table('institution_types')->where('code', 'sekolah_smk')->first();
        $pkplkType = DB::table('institution_types')->where('code', 'sekolah_pkplk')->first();
        $cabdinType = DB::table('institution_types')->where('code', 'cabdin')->first();

        if ($dinasType) {
            DB::table('institutions')->where('type', 'dinas')->update(['institution_type_id' => $dinasType->id]);
        }
        if ($smaType) {
            DB::table('institutions')->where('type', 'sekolah')->where('school_level', 'SMA')->update(['institution_type_id' => $smaType->id]);
        }
        if ($smkType) {
            DB::table('institutions')->where('type', 'sekolah')->where('school_level', 'SMK')->update(['institution_type_id' => $smkType->id]);
        }
        if ($pkplkType) {
            DB::table('institutions')->where('type', 'sekolah')->where('school_level', 'SLB')->update(['institution_type_id' => $pkplkType->id]);
        }
        if ($cabdinType) {
            DB::table('institutions')->where('type', 'external')->update(['institution_type_id' => $cabdinType->id]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('institutions', function (Blueprint $table) {
            $table->dropForeign(['institution_type_id']);
            $table->dropColumn('institution_type_id');
        });

        Schema::dropIfExists('institution_types');
    }
};
