<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\IjazahRevision;
use App\Services\ApprovalService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class IjazahRevisionController extends Controller
{
    protected $approvalService;

    public function __construct(ApprovalService $approvalService)
    {
        $this->approvalService = $approvalService;
    }

    public function index(Request $request)
    {
        $user = $request->user();

        $query = IjazahRevision::with(['institution', 'submittedBy']);

        // Only school can see their own
        if ($user->hasRole('sekolah')) {
            $query->where('institution_id', $user->institution_id);
        }

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('q') && $request->q !== '') {
            $query->where(function ($q) use ($request) {
                $q->where('ticket_number', 'like', '%'.$request->q.'%')
                    ->orWhere('student_name', 'like', '%'.$request->q.'%')
                    ->orWhere('nisn', 'like', '%'.$request->q.'%');
            });
        }

        $ijazahs = $query->latest()->paginate(10);

        return response()->json($ijazahs);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        // Only schools are allowed to submit
        if (! $user->hasRole('sekolah')) {
            return response()->json(['message' => 'Hanya pihak sekolah yang dapat mengajukan revisi ijazah.'], 403);
        }

        if (! $user->institution_id) {
            return response()->json(['message' => 'Akun Anda belum ditautkan ke instansi sekolah mana pun.'], 400);
        }

        $validated = $request->validate([
            'student_name' => 'required|string|max:255',
            'nisn' => 'required|string|max:50',
            'graduation_year' => 'required|integer',
            'education_level' => 'required|string|max:50',
            'wrong_data_description' => 'required|string',
            'correct_data_description' => 'required|string',
            'file_ijazah_wrong' => 'required|file|mimes:pdf,jpg,jpeg,png|max:2048',
            'file_akte' => 'required|file|mimes:pdf,jpg,jpeg,png|max:2048',
            'file_kk' => 'required|file|mimes:pdf,jpg,jpeg,png|max:2048',
            'file_sptjm' => 'required|file|mimes:pdf,jpg,jpeg,png|max:2048',
            'file_additional' => 'nullable|file|mimes:pdf,jpg,jpeg,png,zip|max:5120',
        ]);

        try {
            DB::beginTransaction();

            $ijazah = new IjazahRevision;
            $ijazah->ticket_number = IjazahRevision::generateTicketNumber();
            $ijazah->institution_id = $user->institution_id;
            $ijazah->student_name = $validated['student_name'];
            $ijazah->nisn = $validated['nisn'];
            $ijazah->graduation_year = $validated['graduation_year'];
            $ijazah->education_level = $validated['education_level'];
            $ijazah->wrong_data_description = $validated['wrong_data_description'];
            $ijazah->correct_data_description = $validated['correct_data_description'];
            $ijazah->submitted_by = $user->id;
            $ijazah->submitted_at = now();

            // Handle uploads
            $basePath = 'ijazah_revisions/'.$ijazah->ticket_number;

            $ijazah->file_ijazah_wrong = $request->file('file_ijazah_wrong')->store($basePath, 'public');
            $ijazah->file_akte = $request->file('file_akte')->store($basePath, 'public');
            $ijazah->file_kk = $request->file('file_kk')->store($basePath, 'public');
            $ijazah->file_sptjm = $request->file('file_sptjm')->store($basePath, 'public');

            if ($request->hasFile('file_additional')) {
                $ijazah->file_additional = $request->file('file_additional')->store($basePath, 'public');
            }

            $ijazah->current_step = 0;
            $ijazah->status = 'verifikasi';

            $ijazah->save();

            DB::commit();

            // Send notification to the first approver (Kepala Sekolah)
            $this->approvalService->notifyNextApprovers($ijazah, 'ijazah');

            return response()->json([
                'message' => 'Pengajuan revisi ijazah berhasil dibuat.',
                'data' => $ijazah,
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json(['message' => 'Gagal membuat pengajuan: '.$e->getMessage()], 500);
        }
    }

    public function show($id, Request $request)
    {
        $user = $request->user();

        $ijazah = IjazahRevision::with([
            'institution',
            'submittedBy',
            'approvals.approver',
            'approvals.step',
        ])->findOrFail($id);

        if ($user->hasRole('sekolah') && $ijazah->institution_id !== $user->institution_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $nextStep = $this->approvalService->getNextStep('ijazah', $ijazah->current_step ?? 0);
        $canApprove = $this->approvalService->canApprove($ijazah, 'ijazah', $user);

        return response()->json([
            'data' => $ijazah,
            'approval_meta' => [
                'next_step' => $nextStep,
                'can_approve' => $canApprove,
            ],
        ]);
    }

    public function approve(Request $request, $id)
    {
        $ijazah = IjazahRevision::findOrFail($id);

        $validated = $request->validate([
            'note' => 'nullable|string',
        ]);

        try {
            $this->approvalService->processApproval($ijazah, 'ijazah', $request->user(), 'approved', $validated['note'] ?? null);

            return response()->json(['message' => 'Pengajuan berhasil disetujui.']);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    public function reject(Request $request, $id)
    {
        $ijazah = IjazahRevision::findOrFail($id);

        $validated = $request->validate([
            'note' => 'required|string',
        ]);

        try {
            $this->approvalService->processApproval($ijazah, 'ijazah', $request->user(), 'rejected', $validated['note']);

            return response()->json(['message' => 'Pengajuan telah ditolak.']);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    public function markReadyForPickup(Request $request, $id)
    {
        $ijazah = IjazahRevision::findOrFail($id);

        if ($ijazah->status !== 'approved') {
            return response()->json(['message' => 'Hanya pengajuan berstatus disetujui yang bisa ditandai siap diambil.'], 400);
        }

        $ijazah->status = 'ready_for_pickup';
        $ijazah->pickup_notified_at = now();
        $ijazah->save();

        return response()->json(['message' => 'Status berhasil diubah menjadi Siap Diambil.']);
    }

    public function markCompleted(Request $request, $id)
    {
        $ijazah = IjazahRevision::findOrFail($id);

        if ($ijazah->status !== 'ready_for_pickup') {
            return response()->json(['message' => 'Pengajuan belum siap diambil.'], 400);
        }

        $ijazah->status = 'completed';
        $ijazah->save();

        return response()->json(['message' => 'Pengajuan telah selesai.']);
    }

    public function trackPublic($ticket)
    {
        $ijazah = IjazahRevision::with(['institution:id,name'])
            ->where('ticket_number', $ticket)
            ->firstOrFail();

        return response()->json([
            'data' => [
                'ticket_number' => $ijazah->ticket_number,
                'student_name' => $ijazah->student_name,
                'nisn' => $ijazah->nisn,
                'institution' => $ijazah->institution,
                'status' => $ijazah->status,
                'submitted_at' => $ijazah->submitted_at,
                'pickup_notified_at' => $ijazah->pickup_notified_at,
            ],
        ]);
    }
}
