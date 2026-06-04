<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('guest_books', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->time('check_in_time');
            $table->time('check_out_time')->nullable();
            $table->string('guest_name');
            $table->string('guest_contact', 20)->nullable()->comment('Nomor HP tamu');
            $table->string('guest_position')->nullable()->comment('Jabatan tamu');
            $table->text('purpose')->comment('Keperluan kunjungan');
            $table->unsignedBigInteger('guest_agency_id')->nullable();
            $table->unsignedBigInteger('target_division_id')
                ->comment('Bidang/divisi yang dituju oleh tamu');
            // Who registered (receptionist user)
            $table->unsignedBigInteger('registered_by')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('guest_agency_id')->references('id')->on('guest_agencies')->nullOnDelete();
            $table->foreign('target_division_id')->references('id')->on('divisions')->restrictOnDelete();
            $table->foreign('registered_by')->references('id')->on('users')->nullOnDelete();

            $table->index('date');
            $table->index('target_division_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('guest_books');
    }
};
