<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('article_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('color', 20)->nullable()->comment('Hex color untuk badge kategori di UI');
            $table->string('icon')->nullable()->comment('Lucide icon name');
            $table->text('description')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('articles', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->comment('Penulis/author artikel');
            $table->unsignedBigInteger('category_id');
            $table->string('title');
            $table->string('slug')->unique()->comment('URL-friendly title untuk SEO');
            $table->text('excerpt')->nullable()->comment('Ringkasan singkat untuk preview');
            $table->longText('content')->comment('Isi artikel (HTML dari Tiptap editor)');
            $table->string('thumbnail_path')->nullable()->comment('Gambar cover artikel');
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft');
            $table->boolean('is_pinned')->default(false)->comment('Tampil di bagian atas/featured');
            $table->boolean('is_public')->default(true)
                  ->comment('True = bisa diakses tanpa login, False = internal saja');
            $table->timestamp('published_at')->nullable()
                  ->comment('Waktu publikasi terjadwal atau sudah dipublikasikan');
            $table->unsignedInteger('view_count')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('user_id')->references('id')->on('users');
            $table->foreign('category_id')->references('id')->on('article_categories');

            $table->index('status');
            $table->index('published_at');
            $table->index('slug');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('articles');
        Schema::dropIfExists('article_categories');
    }
};
