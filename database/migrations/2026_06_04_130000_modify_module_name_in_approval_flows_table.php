<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // We can change it to string or update the enum. 
        // In MySQL, to change enum values safely we can alter the column or change to string.
        // Let's change it to string or enum with 'school_transfer' included.
        // Since Spatie permission/Doctrine DBAL can be tricky with enums, let's use a raw statement or Blueprint change.
        // A simple raw statement is safest for enum alterations in Laravel/MySQL.
        DB::statement("ALTER TABLE approval_flows MODIFY COLUMN module_name ENUM('sppd', 'ijazah', 'bendahara', 'school_transfer') NOT NULL");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE approval_flows MODIFY COLUMN module_name ENUM('sppd', 'ijazah', 'bendahara') NOT NULL");
    }
};
