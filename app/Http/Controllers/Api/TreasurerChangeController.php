<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TreasurerChange;
use App\Services\ApprovalService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class TreasurerChangeController extends Controller
{
    protected $approvalService;

    public function __construct(ApprovalService $approvalService)
    {
        $this->approvalService = $approvalService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $query = TreasurerChange::with(['institution', 'submittedBy']);

        // School users can only see their own institution's requests
        if ($user->hasRole('sekolah')) {
            $query->where('institution_id', $user->institution_id);
        }

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('q') && $request->q !== '') {
            $query->where(function ($q) use ($request) {
                $q->where('reference_number', 'like', '%'.$request->q.'%')
                    ->orWhere('old_treasurer_name', 'like', '%'.$request->q.'%')
                    ->orWhere('new_treasurer_name', 'like', '%'.$request->q.'%');
            });
        }

        $changes = $query->latest()->paginate(10);

        return response()->json($changes);
    }

    /**
     * Get details of the current treasurer for autofill in new requests.
     */
    public function currentTreasurer(Request $request)
    {
        $user = $request->user();
        if (! $user->institution_id) {
            return response()->json(['message' => 'Akun Anda belum ditautkan ke instansi sekolah mana pun.'], 400);
        }

        // Get the latest completed change request
        $latest = TreasurerChange::where('institution_id', $user->institution_id)
            ->where('status', 'completed')
            ->latest('approved_at')
            ->first();

        // Return current values or defaults if none exist yet
        return response()->json([
            'treasurer_name' => $latest ? $latest->new_treasurer_name : 'Budi Santoso, S.Pd',
            'bank_account' => $latest ? $latest->new_bank_account : '0012983745',
            'npwp' => $latest ? $latest->new_npwp : '01.234.567.8-901.000',
            'bank_name' => $latest ? $latest->bank_name : 'Bank Jatim',
            'bank_branch' => $latest ? $latest->bank_branch : 'Cabang Pamekasan',
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $user = $request->user();

        if (! $user->hasRole('sekolah')) {
            return response()->json(['message' => 'Hanya pihak sekolah yang dapat mengajukan perubahan bendahara/rekening.'], 403);
        }

        if (! $user->institution_id) {
            return response()->json(['message' => 'Akun Anda belum ditautkan ke instansi sekolah mana pun.'], 400);
        }

        $validated = $request->validate([
            'change_type' => 'required|in:bendahara,rekening,both',
            'old_treasurer_name' => 'required|string|max:255',
            'old_bank_account' => 'required|string|max:50',
            'old_npwp' => 'required|string|max:50',
            'new_treasurer_name' => 'required_if:change_type,bendahara,both|nullable|string|max:255',
            'new_bank_account' => 'required_if:change_type,rekening,both|nullable|string|max:50',
            'new_npwp' => 'required_if:change_type,bendahara,both|nullable|string|max:50',
            'bank_name' => 'required|string|max:100',
            'bank_branch' => 'required|string|max:255',
            'file_sk_kepsek' => 'required_if:change_type,bendahara,both|nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
            'file_ktp_npwp' => 'required_if:change_type,bendahara,both|nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
            'file_additional' => 'nullable|file|mimes:pdf,jpg,jpeg,png,zip|max:5120',
        ]);

        try {
            DB::beginTransaction();

            $change = new TreasurerChange;
            $change->reference_number = TreasurerChange::generateReferenceNumber();
            $change->institution_id = $user->institution_id;
            $change->change_type = $validated['change_type'];

            // Set old values
            $change->old_treasurer_name = $validated['old_treasurer_name'];
            $change->old_bank_account = $validated['old_bank_account'];
            $change->old_npwp = $validated['old_npwp'];

            // Set new values or copy old ones if unchanged
            $change->new_treasurer_name = $validated['change_type'] === 'rekening'
                ? $validated['old_treasurer_name']
                : $validated['new_treasurer_name'];
            $change->new_bank_account = $validated['change_type'] === 'bendahara'
                ? $validated['old_bank_account']
                : $validated['new_bank_account'];
            $change->new_npwp = $validated['change_type'] === 'rekening'
                ? $validated['old_npwp']
                : $validated['new_npwp'];

            $change->bank_name = $validated['bank_name'];
            $change->bank_branch = $validated['bank_branch'];

            $change->submitted_by = $user->id;
            $change->status = 'draft';
            $change->current_step = 0;

            // Handle uploads
            $basePath = 'treasurer_changes/'.$change->reference_number;

            if ($request->hasFile('file_sk_kepsek')) {
                $change->file_sk_kepsek = $request->file('file_sk_kepsek')->store($basePath, 'public');
            }
            if ($request->hasFile('file_ktp_npwp')) {
                $change->file_ktp_npwp = $request->file('file_ktp_npwp')->store($basePath, 'public');
            }
            if ($request->hasFile('file_additional')) {
                $change->file_additional = $request->file('file_additional')->store($basePath, 'public');
            }

            $change->save();

            DB::commit();

            return response()->json([
                'message' => 'Pengajuan berhasil dibuat sebagai draft.',
                'data' => $change,
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json(['message' => 'Gagal membuat pengajuan: '.$e->getMessage()], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, $id)
    {
        $user = $request->user();
        $change = TreasurerChange::with([
            'institution',
            'submittedBy',
            'approvals.approver',
            'approvals.step',
        ])->findOrFail($id);

        if ($user->hasRole('sekolah') && $change->institution_id !== $user->institution_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $nextStep = $this->approvalService->getNextStep('bendahara', $change->current_step ?? 0);
        $canApprove = $this->approvalService->canApprove($change, 'bendahara', $user);

        return response()->json([
            'data' => $change,
            'approval_meta' => [
                'next_step' => $nextStep,
                'can_approve' => $canApprove,
            ],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $user = $request->user();
        $change = TreasurerChange::findOrFail($id);

        if ($change->submitted_by !== $user->id) {
            return response()->json(['message' => 'Hanya pembuat pengajuan yang dapat mengubah draft.'], 403);
        }

        if (! in_array($change->status, ['draft', 'revisi'])) {
            return response()->json(['message' => 'Pengajuan yang sudah diproses tidak dapat diubah.'], 400);
        }

        $validated = $request->validate([
            'change_type' => 'required|in:bendahara,rekening,both',
            'old_treasurer_name' => 'required|string|max:255',
            'old_bank_account' => 'required|string|max:50',
            'old_npwp' => 'required|string|max:50',
            'new_treasurer_name' => 'required_if:change_type,bendahara,both|nullable|string|max:255',
            'new_bank_account' => 'required_if:change_type,rekening,both|nullable|string|max:50',
            'new_npwp' => 'required_if:change_type,bendahara,both|nullable|string|max:50',
            'bank_name' => 'required|string|max:100',
            'bank_branch' => 'required|string|max:255',
            'file_sk_kepsek' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
            'file_ktp_npwp' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
            'file_additional' => 'nullable|file|mimes:pdf,jpg,jpeg,png,zip|max:5120',
        ]);

        try {
            DB::beginTransaction();

            $change->change_type = $validated['change_type'];
            $change->old_treasurer_name = $validated['old_treasurer_name'];
            $change->old_bank_account = $validated['old_bank_account'];
            $change->old_npwp = $validated['old_npwp'];

            $change->new_treasurer_name = $validated['change_type'] === 'rekening'
                ? $validated['old_treasurer_name']
                : $validated['new_treasurer_name'];
            $change->new_bank_account = $validated['change_type'] === 'bendahara'
                ? $validated['old_bank_account']
                : $validated['new_bank_account'];
            $change->new_npwp = $validated['change_type'] === 'rekening'
                ? $validated['old_npwp']
                : $validated['new_npwp'];

            $change->bank_name = $validated['bank_name'];
            $change->bank_branch = $validated['bank_branch'];

            // Handle uploads
            $basePath = 'treasurer_changes/'.$change->reference_number;

            if ($request->hasFile('file_sk_kepsek')) {
                if ($change->file_sk_kepsek) {
                    Storage::disk('public')->delete($change->file_sk_kepsek);
                }
                $change->file_sk_kepsek = $request->file('file_sk_kepsek')->store($basePath, 'public');
            }
            if ($request->hasFile('file_ktp_npwp')) {
                if ($change->file_ktp_npwp) {
                    Storage::disk('public')->delete($change->file_ktp_npwp);
                }
                $change->file_ktp_npwp = $request->file('file_ktp_npwp')->store($basePath, 'public');
            }
            if ($request->hasFile('file_additional')) {
                if ($change->file_additional) {
                    Storage::disk('public')->delete($change->file_additional);
                }
                $change->file_additional = $request->file('file_additional')->store($basePath, 'public');
            }

            $change->save();

            DB::commit();

            return response()->json(['message' => 'Pengajuan berhasil diperbarui.', 'data' => $change]);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json(['message' => 'Gagal memperbarui pengajuan: '.$e->getMessage()], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $change = TreasurerChange::findOrFail($id);

        if ($change->status !== 'draft') {
            return response()->json(['message' => 'Hanya draft yang dapat dihapus.'], 400);
        }

        // Delete files
        Storage::disk('public')->deleteDirectory('treasurer_changes/'.$change->reference_number);
        $change->delete();

        return response()->json(['message' => 'Pengajuan berhasil dihapus.']);
    }

    /**
     * Submit request to the approval flow.
     */
    public function submit(Request $request, $id)
    {
        $change = TreasurerChange::findOrFail($id);

        if ($change->status !== 'draft' && $change->status !== 'revisi') {
            return response()->json(['message' => 'Hanya draft atau revisi yang dapat diajukan.'], 400);
        }

        $change->status = 'submitted';
        $change->submitted_at = now();
        $change->save();

        // Notify next step approver (Kepala Sekolah)
        $this->approvalService->notifyNextApprovers($change, 'bendahara');

        return response()->json(['message' => 'Pengajuan berhasil diajukan untuk verifikasi.']);
    }

    /**
     * Approve the request step.
     */
    public function approve(Request $request, $id)
    {
        $change = TreasurerChange::findOrFail($id);

        $validated = $request->validate([
            'note' => 'nullable|string',
        ]);

        try {
            $this->approvalService->processApproval($change, 'bendahara', $request->user(), 'approved', $validated['note'] ?? null);

            // If fully approved, change status to ready_to_print and generate PDF
            if ($change->status === 'approved') {
                $change->status = 'ready_to_print';
                $change->approved_at = now();
                $change->save();

                $this->generateRecommendationPdf($change->id);
            }

            return response()->json(['message' => 'Pengajuan berhasil disetujui.']);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    /**
     * Reject the request step.
     */
    public function reject(Request $request, $id)
    {
        $change = TreasurerChange::findOrFail($id);

        $validated = $request->validate([
            'note' => 'required|string',
        ]);

        try {
            $this->approvalService->processApproval($change, 'bendahara', $request->user(), 'rejected', $validated['note']);

            return response()->json(['message' => 'Pengajuan telah ditolak/dikembalikan.']);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    /**
     * Download the recommendation letter PDF.
     */
    public function downloadPdf($id)
    {
        $change = TreasurerChange::findOrFail($id);

        if (! $change->recommendation_letter_path) {
            return response()->json(['message' => 'Dokumen belum diterbitkan.'], 404);
        }

        $change->status = 'completed';
        $change->document_generated_at = now();
        $change->save();

        return Storage::disk('public')->download($change->recommendation_letter_path);
    }

    /**
     * Generate the PDF and save it in public storage.
     */
    private function generateRecommendationPdf($id)
    {
        $change = TreasurerChange::with(['institution', 'submittedBy'])->findOrFail($id);
        $verificationToken = md5($change->reference_number.uniqid());
        $verificationUrl = url("/verify/doc/{$verificationToken}");

        // Persist the QR token to the latest approved DocumentApproval record
        $latestApproval = $change->approvals()
            ->where('status', 'approved')
            ->orderBy('step_order', 'desc')
            ->first();

        if ($latestApproval) {
            $latestApproval->update([
                'qr_verification_token' => $verificationToken,
                'qr_verification_url'   => $verificationUrl,
            ]);
        }

        // Get the active Kadis signer for TTE
        $signer = \App\Models\User::where('is_active', true)
            ->whereHas('roles', fn ($q) => $q->where('name', 'kadis'))
            ->first();

        $signerName = $signer?->name ?? 'MOHAMMAD ALWI, M.Pd';
        $signerNip  = $signer?->nip ?? '19680512 199303 1 005';
        $signatureImagePath = $signer?->signature_image_path
            ? storage_path('app/public/' . $signer->signature_image_path)
            : null;

        // Generate QR code as SVG content to inline in PDF
        $qrCode = QrCode::size(80)->generate($verificationUrl);

        $pdf = Pdf::loadView('pdf.recommendation_letter', compact(
            'change', 'qrCode', 'verificationUrl',
            'signerName', 'signerNip', 'signatureImagePath'
        ));

        $path = "treasurer_changes/{$change->reference_number}/surat_rekomendasi.pdf";
        Storage::disk('public')->put($path, $pdf->output());

        $change->recommendation_letter_path = $path;
        $change->save();
    }
}
