<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('document_approvals', function (Blueprint $table) {
            $table->id();
            // Polymorphic relation: links to sppds, ijazah_revisions, or treasurer_changes
            $table->string('document_type')->comment('Model class e.g. App\\Models\\Sppd');
            $table->unsignedBigInteger('document_id');
            // Which approval flow step this record corresponds to
            $table->unsignedBigInteger('approval_flow_id')->nullable();
            $table->integer('step_order');
            // Who performed the action
            $table->unsignedBigInteger('user_id')->nullable()->comment('The approver/verifier user');
            $table->enum('status', ['pending', 'approved', 'rejected', 'forwarded', 'revised'])
                ->default('pending');
            $table->text('note')->nullable()->comment('Catatan/alasan dari approver');
            // QR verification token — unique per document approval chain
            $table->string('qr_verification_token')->nullable()->unique()
                ->comment('Token acak untuk URL verifikasi publik /verify/doc/{token}');
            $table->string('qr_verification_url')->nullable();
            $table->timestamp('acted_at')->nullable();
            $table->timestamps();

            $table->index(['document_type', 'document_id']);
            $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();
            $table->foreign('approval_flow_id')->references('id')->on('approval_flows')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_approvals');
    }
};
