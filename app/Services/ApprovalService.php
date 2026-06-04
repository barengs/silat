<?php

namespace App\Services;

use App\Models\ApprovalFlow;
use App\Models\DocumentApproval;
use App\Models\User;
use App\Notifications\DocumentNotification;
use Exception;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;

class ApprovalService
{
    /**
     * Get the next required step for the document based on its current step.
     */
    public function getNextStep(string $module, int $currentStepOrder): ?ApprovalFlow
    {
        return ApprovalFlow::where('module_name', $module)
            ->where('is_active', true)
            ->where('step_order', '>', $currentStepOrder)
            ->orderBy('step_order', 'asc')
            ->first();
    }

    /**
     * Check if a user has permission to approve the current step.
     */
    public function canApprove(Model $document, string $module, User $user): bool
    {
        // Must implement 'current_step' in document
        $nextStep = $this->getNextStep($module, $document->current_step ?? 0);

        if (! $nextStep) {
            return false;
        }

        // If step requires a specific role
        if ($nextStep->role_id_required) {
            $role = Role::find($nextStep->role_id_required);
            if ($role && ! $user->hasRole($role->name)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Process an approval action (approve/reject).
     */
    public function processApproval(Model $document, string $module, User $user, string $action, ?string $notes = null): Model
    {
        DB::beginTransaction();

        try {
            $currentStepOrder = $document->current_step ?? 0;
            $nextStep = $this->getNextStep($module, $currentStepOrder);

            if (! $nextStep) {
                throw new Exception('Dokumen ini tidak membutuhkan persetujuan lagi.');
            }

            if (! $this->canApprove($document, $module, $user)) {
                throw new Exception('Anda tidak memiliki akses untuk menyetujui langkah ini.');
            }

            // Create Approval Record
            $approval = new DocumentApproval([
                'user_id' => $user->id,
                'approval_flow_id' => $nextStep->id,
                'step_order' => $nextStep->step_order,
                'status' => $action,
                'note' => $notes,
                'acted_at' => now(),
            ]);
            $document->approvals()->save($approval);

            if ($action === 'rejected') {
                $document->status = 'rejected';
                $document->rejection_note = $notes;

                $document->save();
                DB::commit();

                // Send notification to submitter
                $this->notifySubmitterRejection($document, $module, $notes ?? 'Tidak ada catatan.');
            } else {
                // Approved this step
                $document->current_step = $nextStep->step_order;

                // Check if this was the last step
                $subsequentStep = $this->getNextStep($module, $nextStep->step_order);
                if (! $subsequentStep) {
                    $document->status = 'approved';

                    $document->save();
                    DB::commit();

                    // Send notification of final approval to submitter
                    $this->notifySubmitterApproved($document, $module);
                } else {
                    $document->status = 'verifikasi';

                    $document->save();
                    DB::commit();

                    // Send notification to next step approvers
                    $this->notifyNextApprovers($document, $module);
                }
            }

            return $document;
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Send notification to the users who are responsible for the next step.
     */
    public function notifyNextApprovers(Model $document, string $module, ?string $customTitle = null, ?string $customMessage = null): void
    {
        $currentStepOrder = $document->current_step ?? 0;
        $nextStep = $this->getNextStep($module, $currentStepOrder);

        if (! $nextStep || ! $nextStep->role_id_required) {
            return;
        }

        // Get the role name
        $role = Role::find($nextStep->role_id_required);
        if (! $role) {
            return;
        }

        // Find users with this role
        $query = User::role($role->name)->where('is_active', true);

        // If the role is school-specific, filter by institution
        if (in_array($role->name, ['kepala-sekolah', 'operator-sekolah'])) {
            $query->where('institution_id', $document->institution_id);
        }

        $users = $query->get();

        $title = $customTitle ?? 'Persetujuan Baru Menunggu Anda';
        $docName = $this->getDocumentName($document, $module);
        $message = $customMessage ?? "Dokumen {$docName} telah diajukan dan membutuhkan tindakan Anda: {$nextStep->step_label}.";
        $actionUrl = $this->getActionUrl($document, $module);

        $notification = new DocumentNotification($document, $title, $message, $actionUrl);

        foreach ($users as $user) {
            $user->notify($notification);
        }
    }

    /**
     * Send notification to the submitter when document is rejected.
     */
    public function notifySubmitterRejection(Model $document, string $module, string $notes): void
    {
        $submitter = $document->submittedBy ?? $document->user;
        if (! $submitter) {
            return;
        }

        $docName = $this->getDocumentName($document, $module);
        $title = 'Dokumen Perlu Revisi / Ditolak';
        $message = "Dokumen {$docName} Anda memerlukan perbaikan atau ditolak dengan catatan: \"{$notes}\".";
        $actionUrl = $this->getActionUrl($document, $module);

        $notification = new DocumentNotification($document, $title, $message, $actionUrl);
        $submitter->notify($notification);
    }

    /**
     * Send notification to the submitter when document is fully approved.
     */
    public function notifySubmitterApproved(Model $document, string $module): void
    {
        $submitter = $document->submittedBy ?? $document->user;
        if (! $submitter) {
            return;
        }

        $docName = $this->getDocumentName($document, $module);
        $title = 'Dokumen Disetujui Sepenuhnya';
        $message = "Selamat! Dokumen {$docName} Anda telah disetujui sepenuhnya oleh Kepala Dinas dan selesai diproses.";
        $actionUrl = $this->getActionUrl($document, $module);

        $notification = new DocumentNotification($document, $title, $message, $actionUrl);
        $submitter->notify($notification);
    }

    /**
     * Helper to get display name for the document.
     */
    protected function getDocumentName(Model $document, string $module): string
    {
        switch (strtolower($module)) {
            case 'ijazah':
                return "Revisi Ijazah (#{$document->ticket_number})";
            case 'sppd':
                return 'SPPD ('.($document->document_number ?? 'Draft').')';
            case 'bendahara':
                return "Perubahan Bendahara (#{$document->reference_number})";
            default:
                return "Dokumen (#{$document->id})";
        }
    }

    /**
     * Helper to get Frontend view URL for the document.
     */
    protected function getActionUrl(Model $document, string $module): string
    {
        switch (strtolower($module)) {
            case 'ijazah':
                return "/ijazah/{$document->id}";
            case 'sppd':
                return "/sppd/{$document->id}";
            case 'bendahara':
                return "/treasurer/{$document->id}";
            default:
                return '/dashboard';
        }
    }
}
