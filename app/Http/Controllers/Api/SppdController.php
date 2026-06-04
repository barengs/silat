<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ApprovalFlow;
use App\Models\Sppd;
use App\Models\SppdMember;
use App\Models\TransportType;
use App\Models\User;
use App\Services\ApprovalService;
use App\Services\ConflictCheckService;
use Barryvdh\DomPDF\Facade\Pdf;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SppdController extends Controller
{
    protected $conflictService;

    protected $approvalService;

    public function __construct(ConflictCheckService $conflictService, ApprovalService $approvalService)
    {
        $this->conflictService = $conflictService;
        $this->approvalService = $approvalService;
    }

    /**
     * List SPPDs with role-based visibility.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $status = $request->query('status', 'all');

        $query = Sppd::with(['user:id,name,nip,photo_path', 'institution:id,name', 'transportType:id,name'])
            ->withCount('members');

        // RBAC logic:
        // Admin/Pimpinan can see all.
        // School staff can only see their school's SPPD.
        // Dinas staff can see their division's SPPD.
        if (! $user->hasRole('super-admin') && ! $user->hasRole('admin') && ! $user->hasPermissionTo('sppd.view-all')) {
            if ($user->institution_id) {
                // School user
                $query->where('institution_id', $user->institution_id);
            } elseif ($user->division_id) {
                // Dinas normal user: See SPPDs created by anyone in their division OR where they are a member
                $query->where(function ($q) use ($user) {
                    $q->whereHas('user', function ($u) use ($user) {
                        $u->where('division_id', $user->division_id);
                    })->orWhereHas('members', function ($q2) use ($user) {
                        $q2->where('user_id', $user->id);
                    });
                });
            } else {
                // Fallback for users with no division or institution
                $query->where('user_id', $user->id);
            }
        }

        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        $sppds = $query->latest()->paginate(10);

        return response()->json($sppds);
    }

    /**
     * Store new SPPD Draft.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'purpose' => 'required|string',
            'destination' => 'required|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'transport_type_id' => 'required|exists:transport_types,id',
            'budget_source' => 'required|string',
            'members' => 'nullable|array',
            'members.*.user_id' => 'required|exists:users,id',
            'members.*.role_in_trip' => 'nullable|string',
        ]);

        $user = $request->user();

        // 1. Check Unreported SPPD
        if (Sppd::hasUnreportedSppd($user->id)) {
            return response()->json(['message' => 'Anda masih memiliki laporan SPPD (LPP) yang belum diselesaikan.'], 403);
        }

        // 2. Conflict Check (Requester + Members)
        $userIds = [$user->id];
        if (! empty($validated['members'])) {
            $userIds = array_merge($userIds, array_column($validated['members'], 'user_id'));
        }

        $conflicts = $this->conflictService->getConflictingUsers($userIds, $validated['start_date'], $validated['end_date'], null);
        if (! empty($conflicts)) {
            // Find names
            $conflictNames = User::whereIn('id', $conflicts)->pluck('name')->implode(', ');

            return response()->json([
                'message' => "Terjadi bentrok jadwal perjalanan dinas untuk pegawai berikut: {$conflictNames}",
            ], 422);
        }

        DB::beginTransaction();
        try {
            // Generate temporary document number if needed, or leave null for draft
            $sppd = Sppd::create([
                'user_id' => $user->id,
                'institution_id' => $user->institution_id, // Inherit from user
                'destination' => $validated['destination'],
                'purpose' => $validated['purpose'],
                'start_date' => $validated['start_date'],
                'end_date' => $validated['end_date'],
                'transport_type_id' => $validated['transport_type_id'],
                'budget_source' => $validated['budget_source'],
                'status' => 'draft',
                'current_step' => 0,
            ]);

            if (! empty($validated['members'])) {
                $membersData = array_map(function ($m) use ($sppd) {
                    return [
                        'sppd_id' => $sppd->id,
                        'user_id' => $m['user_id'],
                        'role_in_trip' => $m['role_in_trip'] ?? null,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }, $validated['members']);
                SppdMember::insert($membersData);
            }

            DB::commit();

            return response()->json(['message' => 'Draft SPPD berhasil dibuat.', 'data' => $sppd], 201);
        } catch (Exception $e) {
            DB::rollBack();

            return response()->json(['message' => 'Gagal menyimpan SPPD: '.$e->getMessage()], 500);
        }
    }

    /**
     * Show SPPD detail.
     */
    public function show(Request $request, $id)
    {
        $user = $request->user();

        $sppd = Sppd::with([
            'user:id,name,nip,photo_path',
            'institution:id,name',
            'transportType:id,name',
            'members.user:id,name,nip,photo_path,division_id',
            'members.user.division:id,name',
            'approvals.user:id,name,photo_path',
            'report',
        ])->findOrFail($id);

        // Access check could be added here

        $approvalFlows = ApprovalFlow::getFlowForModule('SPPD');

        return response()->json([
            'sppd' => $sppd,
            'approval_flows' => $approvalFlows,
        ]);
    }

    /**
     * Submit SPPD to Approval Workflow.
     */
    public function submit(Request $request, $id)
    {
        $sppd = Sppd::findOrFail($id);

        if ($sppd->status !== 'draft') {
            return response()->json(['message' => 'Hanya draft SPPD yang bisa di-submit.'], 422);
        }

        $sppd->status = 'submitted';
        // Give it a temp number or official number depending on rule. We leave it null or generate
        $sppd->save();

        // Send notification to the first approver
        $this->approvalService->notifyNextApprovers($sppd, 'sppd');

        return response()->json(['message' => 'SPPD berhasil diajukan untuk verifikasi.']);
    }

    /**
     * Approve SPPD step.
     */
    public function approve(Request $request, $id)
    {
        $sppd = Sppd::findOrFail($id);
        $notes = $request->input('notes');

        try {
            $this->approvalService->processApproval($sppd, 'SPPD', $request->user(), 'approved', $notes);

            // If it becomes approved, generate doc number if needed
            if ($sppd->status === 'approved' && ! $sppd->document_number) {
                $year = date('Y');
                $sppd->document_number = "090/{$sppd->id}/432.301/{$year}";
                $sppd->save();
            }

            return response()->json(['message' => 'SPPD berhasil disetujui.']);
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], 403);
        }
    }

    /**
     * Reject SPPD step.
     */
    public function reject(Request $request, $id)
    {
        $sppd = Sppd::findOrFail($id);
        $notes = $request->input('notes');

        if (! $notes) {
            return response()->json(['message' => 'Catatan penolakan wajib diisi.'], 422);
        }

        try {
            $this->approvalService->processApproval($sppd, 'SPPD', $request->user(), 'rejected', $notes);

            return response()->json(['message' => 'SPPD berhasil ditolak.']);
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], 403);
        }
    }

    /**
     * Search Users for Members Autocomplete.
     */
    public function searchMembers(Request $request)
    {
        $q = $request->query('q');
        if (! $q) {
            return response()->json([]);
        }

        $users = User::with('division:id,name')
            ->where('is_active', true)
            ->where(function ($query) use ($q) {
                $query->where('name', 'like', "%{$q}%")
                    ->orWhere('nip', 'like', "%{$q}%");
            })
            ->select('id', 'name', 'nip', 'division_id')
            ->take(10)
            ->get();

        return response()->json($users);
    }

    public function referenceData(Request $request)
    {
        return response()->json([
            'transport_types' => TransportType::all(['id', 'name']),
        ]);
    }

    /**
     * Download SPPD PDF.
     */
    public function downloadPdf(Request $request, $id)
    {
        $sppd = Sppd::with([
            'user.roles',
            'institution',
            'transportType',
            'members.user',
        ])->findOrFail($id);

        // Only approved or active SPPD can be downloaded
        if (! in_array($sppd->status, ['approved', 'active', 'reported', 'closed'])) {
            return response()->json(['message' => 'SPPD belum disetujui, tidak dapat mengunduh PDF.'], 403);
        }

        $pdf = Pdf::loadView('pdf.sppd', compact('sppd'));

        return $pdf->download('SPPD_'.$sppd->user->name.'.pdf');
    }
}
