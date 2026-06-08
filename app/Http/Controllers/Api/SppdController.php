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
            if ($status === 'monitoring') {
                $query->whereIn('status', ['reported', 'closed']);
            } else {
                $query->where('status', $status);
            }
        }

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('document_number', 'like', "%{$search}%")
                  ->orWhere('purpose', 'like', "%{$search}%")
                  ->orWhere('destination', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($qu) use ($search) {
                      $qu->where('name', 'like', "%{$search}%");
                  });
            });
        }

        $perPage = $request->query('per_page', 10);
        $sppds = $query->latest()->paginate($perPage);

        return response()->json($sppds);
    }

    /**
     * Store new SPPD Draft.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'purpose'                => 'required|string',
            'destination'            => 'required|string',
            'start_date'             => 'required|date',
            'end_date'               => 'required|date|after_or_equal:start_date',
            'transport_type_id'      => 'required|exists:transport_types,id',
            'budget_source'          => 'nullable|string',
            'members'                => 'nullable|array',
            'members.*.name'         => 'required|string|max:255',
            'members.*.nip'          => 'nullable|string|max:50',
            'members.*.role_in_trip' => 'nullable|string|max:255',
        ]);

        $user = $request->user();

        // Deteksi jenis pengaju berdasarkan role/profil user:
        // Jika user berasal dari sekolah (punya institution_id & bukan staff dinas) → alur sekolah
        // Jika user adalah staff/operator dinas → langsung ke Kabid
        $isDinasStaff = $user->hasAnyRole(['super-admin', 'admin', 'admin-disdik', 'operator-dinas', 'kabid'])
            || ($user->division_id && !$user->institution_id);
        $submitterType = $isDinasStaff ? 'dinas' : 'sekolah';

        // Check Unreported SPPD
        if (Sppd::hasUnreportedSppd($user->id)) {
            return response()->json(['message' => 'Anda masih memiliki laporan SPPD (LPP) yang belum diselesaikan.'], 403);
        }

        DB::beginTransaction();
        try {
            $sppd = Sppd::create([
                'user_id'           => $user->id,
                'institution_id'    => $user->institution_id,
                'submitter_type'    => $submitterType,
                'destination'       => $validated['destination'],
                'purpose'           => $validated['purpose'],
                'start_date'        => $validated['start_date'],
                'end_date'          => $validated['end_date'],
                'transport_type_id' => $validated['transport_type_id'],
                'budget_source'     => $validated['budget_source'] ?? null,
                'status'            => 'draft',
                'current_step'      => $submitterType === 'dinas' ? 1 : 0,
            ]);

            if (! empty($validated['members'])) {
                $membersData = array_map(function ($m) use ($sppd) {
                    return [
                        'sppd_id'      => $sppd->id,
                        'user_id'      => null,
                        'member_name'  => $m['name'],
                        'member_nip'   => $m['nip'] ?? null,
                        'role_in_trip' => $m['role_in_trip'] ?? null,
                        'created_at'   => now(),
                        'updated_at'   => now(),
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
        if ($sppd->submitter_type === 'dinas') {
            $approvalFlows = $approvalFlows->filter(function($flow) {
                return $flow->step_order > 1;
            })->values();
        }

        $nextStep = $this->approvalService->getNextStep('sppd', $sppd->current_step ?? 0);
        $canApprove = $this->approvalService->canApprove($sppd, 'sppd', $user);

        return response()->json([
            'sppd' => $sppd,
            'approval_flows' => $approvalFlows,
            'approval_meta' => [
                'next_step' => $nextStep,
                'can_approve' => $canApprove,
            ],
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

        // Jika pengaju dari dinas, lewati step verifikasi (step 1)
        // dan langsung masuk ke step persetujuan Kabid
        if ($sppd->submitter_type === 'dinas') {
            $skipToStep = \App\Models\ApprovalFlow::where('module_name', 'sppd')
                ->where('is_active', true)
                ->where('step_order', '>', 1)
                ->orderBy('step_order', 'asc')
                ->first();
            // Set current_step ke step sebelum step Kabid agar getNextStep() mengembalikan step Kabid
            $sppd->current_step = $skipToStep ? ($skipToStep->step_order - 1) : 0;
        }

        $sppd->status = 'submitted';
        $sppd->save();

        // Kirim notifikasi ke approver yang sesuai jalur
        $this->approvalService->notifyNextApprovers($sppd, 'sppd');

        $message = $sppd->submitter_type === 'dinas'
            ? 'SPPD berhasil diajukan dan langsung diteruskan ke Kepala Bidang untuk persetujuan.'
            : 'SPPD berhasil diajukan untuk verifikasi admin.';

        return response()->json(['message' => $message]);
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
            'approvals.user', // ensure approvals and their users are loaded
        ])->findOrFail($id);

        // Only approved or active SPPD can be downloaded
        if (! in_array($sppd->status, ['approved', 'active', 'reported', 'closed'])) {
            return response()->json(['message' => 'SPPD belum disetujui, tidak dapat mengunduh PDF.'], 403);
        }

        // Get the Kabid signer
        $kabidApproval = $sppd->approvals->filter(function($appr) {
            return $appr->user && $appr->user->hasRole('kabid') && $appr->status === 'approved';
        })->first();

        $signer = $kabidApproval ? $kabidApproval->user : \App\Models\User::role('kabid')->where('is_active', true)->first();

        $signatureImagePath = $signer && $signer->signature_image_path
            ? storage_path('app/public/' . $signer->signature_image_path)
            : null;

        $pdf = Pdf::loadView('pdf.sppd', compact('sppd', 'signer', 'signatureImagePath'));

        return $pdf->download('SPPD_'.$sppd->user->name.'.pdf');
    }
}
