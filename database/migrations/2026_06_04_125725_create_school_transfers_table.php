<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('school_transfers', function (Blueprint $table) {
            $table->id();
            $table->string('transfer_number')->unique();
            $table->foreignId('institution_id')->constrained()->cascadeOnDelete();
            
            // Student Info
            $table->string('student_name');
            $table->string('nisn');
            $table->string('gender');
            $table->string('grade');
            
            // Transfer Details
            $table->string('target_school');
            $table->text('target_school_address');
            $table->text('reason');
            
            // Attachments
            $table->string('file_request_letter');
            $table->string('file_report_card');
            $table->string('file_mutation_letter');
            $table->string('file_additional')->nullable();
            
            // Workflow States
            $table->string('status')->default('draft'); // draft, submitted, verifikasi, approved, rejected
            $table->integer('current_step')->default(0);
            $table->string('recommendation_letter_path')->nullable();
            
            $table->foreignId('submitted_by')->constrained('users')->cascadeOnDelete();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('school_transfers');
    }
};
