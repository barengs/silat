<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SchoolTransfer;
use App\Services\ApprovalService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class SchoolTransferController extends Controller
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
        $query = SchoolTransfer::with(['institution', 'submittedBy']);

        // Users without view-all permission can only see their own institution's requests
        if (! $user->hasRole('super-admin') && ! $user->hasPermissionTo('school-transfers.view-all')) {
            $query->where('institution_id', $user->institution_id);
        }

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('q') && $request->q !== '') {
            $query->where(function ($q) use ($request) {
                $q->where('transfer_number', 'like', '%'.$request->q.'%')
                    ->orWhere('student_name', 'like', '%'.$request->q.'%')
                    ->orWhere('nisn', 'like', '%'.$request->q.'%')
                    ->orWhere('target_school', 'like', '%'.$request->q.'%');
            });
        }

        $transfers = $query->latest()->paginate(10);

        return response()->json($transfers);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $user = $request->user();

        // For superadmin/dinas (without institution_id), they must provide an institution_id
        if (! $user->institution_id && ! $request->has('institution_id')) {
            return response()->json(['message' => 'Pilih sekolah terlebih dahulu.'], 400);
        }


        $validated = $request->validate([
            'student_name' => 'required|string|max:255',
            'nisn' => 'required|string|max:50',
            'gender' => 'required|string|in:Laki-laki,Perempuan',
            'grade' => 'required|string|max:50',
            'target_school' => 'required|string|max:255',
            'target_school_address' => 'required|string',
            'reason' => 'required|string',
            'file_request_letter' => 'required|file|mimes:pdf,jpg,jpeg,png|max:2048',
            'file_report_card' => 'required|file|mimes:pdf,jpg,jpeg,png|max:2048',
            'file_mutation_letter' => 'required|file|mimes:pdf,jpg,jpeg,png|max:2048',
            'file_additional' => 'nullable|file|mimes:pdf,jpg,jpeg,png,zip|max:5120',
        ]);

        try {
            DB::beginTransaction();

            $transfer = new SchoolTransfer();
            $transfer->transfer_number = SchoolTransfer::generateTransferNumber();
            $transfer->institution_id = $user->institution_id ?: $request->input('institution_id');
            $transfer->student_name = $validated['student_name'];
            $transfer->nisn = $validated['nisn'];
            $transfer->gender = $validated['gender'];
            $transfer->grade = $validated['grade'];
            $transfer->target_school = $validated['target_school'];
            $transfer->target_school_address = $validated['target_school_address'];
            $transfer->reason = $validated['reason'];
            $transfer->submitted_by = $user->id;
            $transfer->status = 'draft';
            $transfer->current_step = 0;

            // Handle uploads
            $basePath = 'school_transfers/'.$transfer->transfer_number;

            $transfer->file_request_letter = $request->file('file_request_letter')->store($basePath, 'public');
            $transfer->file_report_card = $request->file('file_report_card')->store($basePath, 'public');
            $transfer->file_mutation_letter = $request->file('file_mutation_letter')->store($basePath, 'public');

            if ($request->hasFile('file_additional')) {
                $transfer->file_additional = $request->file('file_additional')->store($basePath, 'public');
            }

            $transfer->save();

            DB::commit();

            return response()->json([
                'message' => 'Pengajuan pindah sekolah berhasil dibuat sebagai draft.',
                'data' => $transfer,
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
        $transfer = SchoolTransfer::with([
            'institution',
            'submittedBy',
            'approvals.approver',
            'approvals.step',
        ])->findOrFail($id);

        if ($user->isSekolah() && $transfer->institution_id !== $user->institution_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $nextStep = $this->approvalService->getNextStep('school_transfer', $transfer->current_step ?? 0);
        $canApprove = $this->approvalService->canApprove($transfer, 'school_transfer', $user);

        return response()->json([
            'data' => $transfer,
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
        $transfer = SchoolTransfer::findOrFail($id);

        if ($transfer->submitted_by !== $user->id) {
            return response()->json(['message' => 'Hanya pembuat pengajuan yang dapat mengubah draft.'], 403);
        }

        if (!in_array($transfer->status, ['draft', 'rejected'])) {
            return response()->json(['message' => 'Pengajuan yang sudah diproses tidak dapat diubah.'], 400);
        }

        $validated = $request->validate([
            'student_name' => 'required|string|max:255',
            'nisn' => 'required|string|max:50',
            'gender' => 'required|string|in:Laki-laki,Perempuan',
            'grade' => 'required|string|max:50',
            'target_school' => 'required|string|max:255',
            'target_school_address' => 'required|string',
            'reason' => 'required|string',
            'file_request_letter' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
            'file_report_card' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
            'file_mutation_letter' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
            'file_additional' => 'nullable|file|mimes:pdf,jpg,jpeg,png,zip|max:5120',
        ]);

        try {
            DB::beginTransaction();

            $transfer->student_name = $validated['student_name'];
            $transfer->nisn = $validated['nisn'];
            $transfer->gender = $validated['gender'];
            $transfer->grade = $validated['grade'];
            $transfer->target_school = $validated['target_school'];
            $transfer->target_school_address = $validated['target_school_address'];
            $transfer->reason = $validated['reason'];

            // Handle uploads
            $basePath = 'school_transfers/'.$transfer->transfer_number;

            if ($request->hasFile('file_request_letter')) {
                if ($transfer->file_request_letter) {
                    Storage::disk('public')->delete($transfer->file_request_letter);
                }
                $transfer->file_request_letter = $request->file('file_request_letter')->store($basePath, 'public');
            }

            if ($request->hasFile('file_report_card')) {
                if ($transfer->file_report_card) {
                    Storage::disk('public')->delete($transfer->file_report_card);
                }
                $transfer->file_report_card = $request->file('file_report_card')->store($basePath, 'public');
            }

            if ($request->hasFile('file_mutation_letter')) {
                if ($transfer->file_mutation_letter) {
                    Storage::disk('public')->delete($transfer->file_mutation_letter);
                }
                $transfer->file_mutation_letter = $request->file('file_mutation_letter')->store($basePath, 'public');
            }

            if ($request->hasFile('file_additional')) {
                if ($transfer->file_additional) {
                    Storage::disk('public')->delete($transfer->file_additional);
                }
                $transfer->file_additional = $request->file('file_additional')->store($basePath, 'public');
            }

            // Reset status if it was rejected before being updated
            if ($transfer->status === 'rejected') {
                $transfer->status = 'draft';
                $transfer->current_step = 0;
            }

            $transfer->save();

            DB::commit();

            return response()->json(['message' => 'Pengajuan berhasil diperbarui.', 'data' => $transfer]);

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
        $transfer = SchoolTransfer::findOrFail($id);

        if ($transfer->status !== 'draft') {
            return response()->json(['message' => 'Hanya draft yang dapat dihapus.'], 400);
        }

        // Delete files
        Storage::disk('public')->deleteDirectory('school_transfers/'.$transfer->transfer_number);
        $transfer->delete();

        return response()->json(['message' => 'Pengajuan berhasil dihapus.']);
    }

    /**
     * Submit request to the approval flow.
     */
    public function submit(Request $request, $id)
    {
        $transfer = SchoolTransfer::findOrFail($id);

        if ($transfer->status !== 'draft' && $transfer->status !== 'rejected') {
            return response()->json(['message' => 'Hanya draft atau pengajuan yang ditolak yang dapat diajukan.'], 400);
        }

        $transfer->status = 'submitted';
        $transfer->submitted_at = now();
        $transfer->save();

        // Notify next step approver (Kepala Sekolah)
        $this->approvalService->notifyNextApprovers($transfer, 'school_transfer');

        return response()->json(['message' => 'Pengajuan berhasil diajukan untuk verifikasi.']);
    }

    /**
     * Approve the request step.
     */
    public function approve(Request $request, $id)
    {
        $transfer = SchoolTransfer::findOrFail($id);

        $validated = $request->validate([
            'note' => 'nullable|string',
        ]);

        try {
            $this->approvalService->processApproval($transfer, 'school_transfer', $request->user(), 'approved', $validated['note'] ?? null);

            // If fully approved, generate PDF
            if ($transfer->status === 'approved') {
                $transfer->approved_at = now();
                $transfer->save();

                $this->generateTransferPdf($transfer->id);
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
        $transfer = SchoolTransfer::findOrFail($id);

        $validated = $request->validate([
            'note' => 'required|string',
        ]);

        try {
            $this->approvalService->processApproval($transfer, 'school_transfer', $request->user(), 'rejected', $validated['note']);

            return response()->json(['message' => 'Pengajuan telah ditolak.']);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    /**
     * Download the recommendation letter PDF.
     */
    public function downloadPdf($id)
    {
        $transfer = SchoolTransfer::findOrFail($id);

        if (!$transfer->recommendation_letter_path) {
            return response()->json(['message' => 'Surat rekomendasi belum diterbitkan.'], 404);
        }

        return response()->download(storage_path('app/public/' . $transfer->recommendation_letter_path));
    }

    /**
     * Generate the PDF and save it in public storage.
     */
    private function generateTransferPdf($id)
    {
        $transfer = SchoolTransfer::with(['institution', 'submittedBy'])->findOrFail($id);
        $verificationToken = md5($transfer->transfer_number.uniqid());
        $verificationUrl = url("/verify/doc/{$verificationToken}");

        // Persist the QR token to the latest approved DocumentApproval record
        $latestApproval = $transfer->approvals()
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
        $signer = \App\Models\User::query()
            ->where('is_active', true)
            ->whereRelation('roles', 'name', 'kadis')
            ->first();

        if (! $signer) {
            throw new \Exception('Penandatangan Kepala Dinas tidak ditemukan atau tidak aktif.');
        }

        $signerName = $signer->name;
        $signerNip  = $signer->nip;
        $signatureImagePath = $signer->signature_image_path
            ? storage_path('app/public/' . $signer->signature_image_path)
            : null;

        // Generate QR code as SVG content to inline in PDF
        $qrCode = app('qrcode')->size(80)->generate($verificationUrl);

        $pdf = Pdf::loadView('pdf.school_transfer', compact(
            'transfer', 'qrCode', 'verificationUrl',
            'signerName', 'signerNip', 'signatureImagePath'
        ));

        $path = "school_transfers/{$transfer->transfer_number}/surat_rekomendasi_pindah_sekolah.pdf";
        Storage::disk('public')->put($path, $pdf->output());

        $transfer->recommendation_letter_path = $path;
        $transfer->save();
    }
}
