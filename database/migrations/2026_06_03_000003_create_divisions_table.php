<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('divisions', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->nullable()->unique()->comment('Kode singkat bidang, misal: KABID-DIKDAS');
            $table->text('description')->nullable();
            $table->unsignedBigInteger('parent_id')->nullable()->comment('Untuk sub-bidang');
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('parent_id')->references('id')->on('divisions')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('divisions');
    }
};
