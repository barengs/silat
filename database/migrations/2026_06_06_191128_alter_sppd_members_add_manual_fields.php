<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

return new class extends Migration
{
    public function up(): void
    {
        // Use raw SQL with try-catch to support databases with/without FKs & index variants
        
        // 1. Drop foreign key on user_id if it exists
        try {
            DB::statement('ALTER TABLE sppd_members DROP FOREIGN KEY sppd_members_user_id_foreign');
        } catch (\Exception $e) {
            // ignore
        }

        // 2. Drop foreign key on sppd_id if it exists
        try {
            DB::statement('ALTER TABLE sppd_members DROP FOREIGN KEY sppd_members_sppd_id_foreign');
        } catch (\Exception $e) {
            // ignore
        }

        // 3. Drop unique composite key
        try {
            DB::statement('ALTER TABLE sppd_members DROP INDEX sppd_members_sppd_id_user_id_unique');
        } catch (\Exception $e) {
            // ignore
        }

        // 4. Drop plain index on user_id if it exists
        try {
            DB::statement('ALTER TABLE sppd_members DROP INDEX sppd_members_user_id_foreign');
        } catch (\Exception $e) {
            // ignore
        }

        // 5. Modify columns: make user_id nullable, add manual fields
        DB::statement('ALTER TABLE sppd_members
            MODIFY COLUMN user_id BIGINT UNSIGNED NULL,
            ADD COLUMN member_name VARCHAR(255) NULL COMMENT "Nama manual untuk pegawai non-sistem" AFTER user_id,
            ADD COLUMN member_nip VARCHAR(255) NULL COMMENT "NIP manual untuk pegawai non-sistem" AFTER member_name
        ');

        // 6. Re-add foreign keys
        DB::statement('ALTER TABLE sppd_members ADD CONSTRAINT sppd_members_sppd_id_foreign FOREIGN KEY (sppd_id) REFERENCES sppds(id) ON DELETE CASCADE');
        DB::statement('ALTER TABLE sppd_members ADD CONSTRAINT sppd_members_user_id_foreign FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT');
    }

    public function down(): void
    {
        try {
            DB::statement('ALTER TABLE sppd_members DROP FOREIGN KEY sppd_members_user_id_foreign');
        } catch (\Exception $e) {}

        try {
            DB::statement('ALTER TABLE sppd_members DROP FOREIGN KEY sppd_members_sppd_id_foreign');
        } catch (\Exception $e) {}

        try {
            DB::statement('ALTER TABLE sppd_members DROP COLUMN member_name, DROP COLUMN member_nip');
        } catch (\Exception $e) {}

        DB::statement('ALTER TABLE sppd_members MODIFY COLUMN user_id BIGINT UNSIGNED NOT NULL');

        DB::statement('ALTER TABLE sppd_members ADD CONSTRAINT sppd_members_sppd_id_foreign FOREIGN KEY (sppd_id) REFERENCES sppds(id) ON DELETE CASCADE');
        DB::statement('ALTER TABLE sppd_members ADD CONSTRAINT sppd_members_user_id_foreign FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT');
        DB::statement('ALTER TABLE sppd_members ADD UNIQUE KEY sppd_members_sppd_id_user_id_unique (sppd_id, user_id)');
    }
};
