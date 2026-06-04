<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Sppd;
use App\Models\IjazahRevision;
use App\Models\TreasurerChange;
use App\Services\ApprovalService;
use Illuminate\Pagination\LengthAwarePaginator;

class VerificationController extends Controller
{
    protected $approvalService;

    public function __construct(ApprovalService $approvalService)
    {
        $this->approvalService = $approvalService;
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $module = $request->input('module', 'all');
        $search = $request->input('q', '');
        
        $items = [];

        // 1. Fetch SPPD
        if ($module === 'all' || $module === 'sppd') {
            $sppds = Sppd::with(['user', 'institution'])
                ->whereIn('status', ['submitted', 'verifikasi'])
                ->when($search, function ($query) use ($search) {
                    $query->where(function($q) use ($search) {
                        $q->where('document_number', 'like', "%{$search}%")
                          ->orWhere('destination', 'like', "%{$search}%")
                          ->orWhereHas('user', function($qu) use ($search) {
                              $qu->where('name', 'like', "%{$search}%");
                          })
                          ->orWhereHas('institution', function($qi) use ($search) {
                              $qi->where('name', 'like', "%{$search}%");
                          });
                    });
                })
                ->get();

            foreach ($sppds as $doc) {
                if ($this->approvalService->canApprove($doc, 'sppd', $user)) {
                    $items[] = [
                        'id' => $doc->id,
                        'module' => 'sppd',
                        'module_label' => 'Manajemen SPPD',
                        'title' => 'SPPD - ' . ($doc->user?->name ?? 'Staff'),
                        'detail' => 'Tujuan: ' . $doc->destination,
                        'institution' => $doc->institution?->name ?? 'Dinas Pendidikan',
                        'reference' => $doc->document_number ?? 'DRAFT',
                        'date' => $doc->created_at->toISOString(),
                        'status' => $doc->status,
                        'current_step' => $doc->current_step,
                    ];
                }
            }
        }

        // 2. Fetch Ijazah Revision
        if ($module === 'all' || $module === 'ijazah') {
            $ijazahs = IjazahRevision::with(['institution'])
                ->whereIn('status', ['submitted', 'verifikasi'])
                ->when($search, function ($query) use ($search) {
                    $query->where(function($q) use ($search) {
                        $q->where('ticket_number', 'like', "%{$search}%")
                          ->orWhere('student_name', 'like', "%{$search}%")
                          ->orWhere('nisn', 'like', "%{$search}%")
                          ->orWhereHas('institution', function($qi) use ($search) {
                              $qi->where('name', 'like', "%{$search}%");
                          });
                    });
                })
                ->get();

            foreach ($ijazahs as $doc) {
                if ($this->approvalService->canApprove($doc, 'ijazah', $user)) {
                    $items[] = [
                        'id' => $doc->id,
                        'module' => 'ijazah',
                        'module_label' => 'Revisi Ijazah',
                        'title' => 'Revisi Ijazah - ' . $doc->student_name,
                        'detail' => 'Tahun Lulus: ' . $doc->graduation_year . ' (' . $doc->education_level . ')',
                        'institution' => $doc->institution?->name ?? '-',
                        'reference' => $doc->ticket_number,
                        'date' => $doc->created_at->toISOString(),
                        'status' => $doc->status,
                        'current_step' => $doc->current_step,
                    ];
                }
            }
        }

        // 3. Fetch Treasurer Changes
        if ($module === 'all' || $module === 'bendahara') {
            $treasurers = TreasurerChange::with(['institution'])
                ->whereIn('status', ['submitted', 'verifikasi'])
                ->when($search, function ($query) use ($search) {
                    $query->where(function($q) use ($search) {
                        $q->where('reference_number', 'like', "%{$search}%")
                          ->orWhere('new_treasurer_name', 'like', "%{$search}%")
                          ->orWhere('old_treasurer_name', 'like', "%{$search}%")
                          ->orWhereHas('institution', function($qi) use ($search) {
                              $qi->where('name', 'like', "%{$search}%");
                          });
                    });
                })
                ->get();

            foreach ($treasurers as $doc) {
                if ($this->approvalService->canApprove($doc, 'bendahara', $user)) {
                    $items[] = [
                        'id' => $doc->id,
                        'module' => 'bendahara',
                        'module_label' => 'Perubahan Bendahara',
                        'title' => 'Bendahara - ' . $doc->new_treasurer_name,
                        'detail' => 'Tipe: ' . ($doc->change_type === 'rekening' ? 'Rekening' : ($doc->change_type === 'bendahara' ? 'Bendahara' : 'Keduanya')),
                        'institution' => $doc->institution?->name ?? '-',
                        'reference' => $doc->reference_number,
                        'date' => $doc->created_at->toISOString(),
                        'status' => $doc->status,
                        'current_step' => $doc->current_step,
                    ];
                }
            }
        }

        // Sort by date descending
        usort($items, function ($a, $b) {
            return strcmp($b['date'], $a['date']);
        });

        // Manual pagination
        $currentPage = LengthAwarePaginator::resolveCurrentPage();
        $perPage = 10;
        $currentItems = array_slice($items, ($currentPage - 1) * $perPage, $perPage);
        
        $paginatedItems = new LengthAwarePaginator(
            $currentItems, 
            count($items), 
            $perPage, 
            $currentPage, 
            ['path' => LengthAwarePaginator::resolveCurrentPath()]
        );

        return response()->json($paginatedItems);
    }
}
