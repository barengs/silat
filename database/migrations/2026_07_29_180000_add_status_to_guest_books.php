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
        Schema::table('guest_books', function (Blueprint $table) {
            $table->string('status', 20)->default('menunggu')->after('purpose')->comment('menunggu, berkunjung, selesai');
        });

        // Update existing guest books
        DB::table('guest_books')->whereNotNull('check_out_time')->update(['status' => 'selesai']);
        DB::table('guest_books')->whereNull('check_out_time')->update(['status' => 'berkunjung']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('guest_books', function (Blueprint $table) {
            $table->dropColumn('status');
        });
    }
};
