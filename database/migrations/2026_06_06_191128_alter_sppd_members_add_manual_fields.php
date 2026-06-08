<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

return new class extends Migration
{
    public function up(): void
    {
        // Use raw SQL to safely handle MySQL FK/index constraints in correct order
        // 1. Drop the FK on sppd_id (which locks the unique index from being dropped)
        DB::statement('ALTER TABLE sppd_members DROP FOREIGN KEY sppd_members_sppd_id_foreign');

        // 2. Now we can safely drop the composite unique index
        DB::statement('ALTER TABLE sppd_members DROP INDEX sppd_members_sppd_id_user_id_unique');

        // 3. Drop the plain index on user_id
        DB::statement('ALTER TABLE sppd_members DROP INDEX sppd_members_user_id_foreign');

        // 4. Make user_id nullable, add new columns, re-add sppd_id FK
        DB::statement('ALTER TABLE sppd_members
            MODIFY COLUMN user_id BIGINT UNSIGNED NULL,
            ADD COLUMN member_name VARCHAR(255) NULL COMMENT "Nama manual untuk pegawai non-sistem" AFTER user_id,
            ADD COLUMN member_nip VARCHAR(255) NULL COMMENT "NIP manual untuk pegawai non-sistem" AFTER member_name,
            ADD CONSTRAINT sppd_members_sppd_id_foreign FOREIGN KEY (sppd_id) REFERENCES sppds(id) ON DELETE CASCADE
        ');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE sppd_members DROP FOREIGN KEY sppd_members_sppd_id_foreign');
        DB::statement('ALTER TABLE sppd_members
            DROP COLUMN member_name,
            DROP COLUMN member_nip,
            MODIFY COLUMN user_id BIGINT UNSIGNED NOT NULL,
            ADD CONSTRAINT sppd_members_sppd_id_foreign FOREIGN KEY (sppd_id) REFERENCES sppds(id) ON DELETE CASCADE,
            ADD UNIQUE KEY sppd_members_sppd_id_user_id_unique (sppd_id, user_id),
            ADD INDEX sppd_members_user_id_foreign (user_id)
        ');
    }
};
