<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Link to institution (school or dinas)
            $table->unsignedBigInteger('institution_id')->nullable()->after('id');
            // Link to dinas division (only for dinas staff)
            $table->unsignedBigInteger('division_id')->nullable()->after('institution_id');
            // NIP for PNS staff
            $table->string('nip', 25)->nullable()->unique()->after('name');
            // Phone number
            $table->string('phone', 20)->nullable()->after('email');
            // Profile photo path
            $table->string('photo_path')->nullable()->after('phone');
            // Signature image (for Kadis, Kabid signatories)
            $table->string('signature_image_path')->nullable()->after('photo_path');
            // Account status
            $table->boolean('is_active')->default(true)->after('signature_image_path');
            // Last activity
            $table->timestamp('last_login_at')->nullable()->after('is_active');
            // Soft deletes
            $table->softDeletes()->after('updated_at');

            $table->foreign('institution_id')->references('id')->on('institutions')->nullOnDelete();
            $table->foreign('division_id')->references('id')->on('divisions')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['institution_id', 'division_id']);
            $table->dropColumn([
                'institution_id', 'division_id', 'nip', 'phone',
                'photo_path', 'signature_image_path', 'is_active', 'last_login_at',
            ]);
        });
    }
};
