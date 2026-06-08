<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\GuestBook;
use App\Models\Sppd;
use App\Models\IjazahRevision;
use App\Models\TreasurerChange;
use App\Models\SchoolTransfer;
use App\Models\Article;
use App\Models\DocumentApproval;
use App\Services\ApprovalService;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    protected $approvalService;

    public function __construct(ApprovalService $approvalService)
    {
        $this->approvalService = $approvalService;
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $isSekolah = $user->isSekolah();
        $institutionId = $user->institution_id;

        // 1. STATS (role-aware)
        if ($isSekolah) {
            $sppdCount = Sppd::query()->where('institution_id', $institutionId)->count();
            $sppdActive = Sppd::query()->where('institution_id', $institutionId)->whereIn('status', ['active', 'approved'])->count();
            $sppdPending = Sppd::query()->where('institution_id', $institutionId)->whereIn('status', ['submitted', 'verifikasi'])->count();

            $ijazahCount = IjazahRevision::query()->where('institution_id', $institutionId)->count();
            $ijazahPending = IjazahRevision::query()->where('institution_id', $institutionId)->whereIn('status', ['submitted', 'verifikasi'])->count();

            $treasurerCount = TreasurerChange::query()->where('institution_id', $institutionId)->count();
            $treasurerPending = TreasurerChange::query()->where('institution_id', $institutionId)->whereIn('status', ['submitted', 'verifikasi'])->count();

            $transferCount = SchoolTransfer::query()->where('institution_id', $institutionId)->count();
            $transferPending = SchoolTransfer::query()->where('institution_id', $institutionId)->whereIn('status', ['submitted', 'verifikasi'])->count();

            $stats = [
                [
                    'title' => 'Pengajuan SPPD',
                    'value' => $sppdCount,
                    'badge' => ['text' => "$sppdActive Aktif", 'color' => 'text-blue-700 bg-blue-100'],
                    'icon' => 'Plane',
                    'iconBg' => 'bg-blue-100',
                    'iconColor' => 'text-blue-600',
                    'path' => '/sppd'
                ],
                [
                    'title' => 'SPPD Menunggu',
                    'value' => $sppdPending,
                    'badge' => $sppdPending > 0 ? ['text' => 'Diproses', 'color' => 'text-orange-700 bg-orange-100'] : null,
                    'icon' => 'ClipboardList',
                    'iconBg' => 'bg-orange-100',
                    'iconColor' => 'text-orange-600',
                    'path' => '/sppd'
                ],
                [
                    'title' => 'Revisi Ijazah',
                    'value' => $ijazahCount,
                    'badge' => $ijazahPending > 0 ? ['text' => "$ijazahPending Baru", 'color' => 'text-rose-700 bg-rose-100'] : null,
                    'icon' => 'GraduationCap',
                    'iconBg' => 'bg-rose-100',
                    'iconColor' => 'text-rose-600',
                    'path' => '/ijazah'
                ],
                [
                    'title' => 'Perubahan Bendahara',
                    'value' => $treasurerCount,
                    'badge' => $treasurerPending > 0 ? ['text' => "$treasurerPending Proses", 'color' => 'text-teal-700 bg-teal-100'] : null,
                    'icon' => 'FileSignature',
                    'iconBg' => 'bg-teal-100',
                    'iconColor' => 'text-teal-600',
                    'path' => '/treasurer'
                ],
                [
                    'title' => 'Mutasi Siswa',
                    'value' => $transferCount,
                    'badge' => $transferPending > 0 ? ['text' => "$transferPending Proses", 'color' => 'text-indigo-700 bg-indigo-100'] : null,
                    'icon' => 'GitBranch',
                    'iconBg' => 'bg-indigo-100',
                    'iconColor' => 'text-indigo-600',
                    'path' => '/school-transfers'
                ]
            ];
        } else {
            // Dinas / Admin / Resepsionis / Verifikator / Approver
            $tamuHariIni = GuestBook::query()->today()->count();
            
            $sppdPending = Sppd::query()->whereIn('status', ['submitted', 'verifikasi'])->count();
            $ijazahPending = IjazahRevision::query()->whereIn('status', ['submitted', 'verifikasi', 'ready_for_pickup'])->count();
            $treasurerPending = TreasurerChange::query()->whereIn('status', ['submitted', 'verifikasi'])->count();
            $transferPending = SchoolTransfer::query()->whereIn('status', ['submitted', 'verifikasi'])->count();

            $stats = [
                [
                    'title' => 'Tamu Hari Ini',
                    'value' => $tamuHariIni,
                    'badge' => null,
                    'icon' => 'Users',
                    'iconBg' => 'bg-slate-100',
                    'iconColor' => 'text-slate-600',
                    'path' => '/guest-book'
                ],
                [
                    'title' => 'SPPD Menunggu',
                    'value' => $sppdPending,
                    'badge' => $sppdPending > 0 ? ['text' => 'Butuh Tindakan', 'color' => 'text-rose-700 bg-rose-100'] : null,
                    'icon' => 'ClipboardList',
                    'iconBg' => 'bg-rose-100',
                    'iconColor' => 'text-rose-600',
                    'path' => '/sppd'
                ],
                [
                    'title' => 'Revisi Ijazah Baru',
                    'value' => $ijazahPending,
                    'badge' => null,
                    'icon' => 'GraduationCap',
                    'iconBg' => 'bg-orange-100',
                    'iconColor' => 'text-orange-600',
                    'path' => '/ijazah'
                ],
                [
                    'title' => 'Perubahan Bendahara',
                    'value' => $treasurerPending,
                    'badge' => null,
                    'icon' => 'FileSignature',
                    'iconBg' => 'bg-teal-100',
                    'iconColor' => 'text-teal-600',
                    'path' => '/treasurer'
                ],
                [
                    'title' => 'Mutasi Siswa Menunggu',
                    'value' => $transferPending,
                    'badge' => $transferPending > 0 ? ['text' => 'Butuh Tindakan', 'color' => 'text-indigo-700 bg-indigo-100'] : null,
                    'icon' => 'GitBranch',
                    'iconBg' => 'bg-indigo-100',
                    'iconColor' => 'text-indigo-600',
                    'path' => '/school-transfers'
                ]
            ];
        }

        // 2. ANTRIAN PENDING ACTION (menunggu approval user login saat ini)
        $pendingApprovalsList = [];

        // SPPD
        $pendingSppds = Sppd::with(['user', 'institution'])->whereIn('status', ['submitted', 'verifikasi'])->get();
        foreach ($pendingSppds as $doc) {
            if ($this->approvalService->canApprove($doc, 'sppd', $user)) {
                $pendingApprovalsList[] = [
                    'id' => $doc->id,
                    'module' => 'sppd',
                    'title' => 'SPPD - ' . ($doc->user?->name ?? 'Staff'),
                    'detail' => 'Tujuan: ' . $doc->destination,
                    'institution' => $doc->institution?->name ?? 'Dinas Pendidikan',
                    'reference' => $doc->document_number ?? '-',
                    'date' => $doc->created_at->toISOString(),
                    'current_step' => $doc->current_step,
                    'status' => $doc->status,
                ];
            }
        }

        // Revisi Ijazah
        $pendingIjazahs = IjazahRevision::with(['institution'])->whereIn('status', ['submitted', 'verifikasi'])->get();
        foreach ($pendingIjazahs as $doc) {
            if ($this->approvalService->canApprove($doc, 'ijazah', $user)) {
                $pendingApprovalsList[] = [
                    'id' => $doc->id,
                    'module' => 'ijazah',
                    'title' => 'Revisi Ijazah - ' . $doc->student_name,
                    'detail' => 'Tahun Lulus: ' . $doc->graduation_year . ' (' . $doc->education_level . ')',
                    'institution' => $doc->institution?->name ?? '-',
                    'reference' => $doc->ticket_number,
                    'date' => $doc->created_at->toISOString(),
                    'current_step' => $doc->current_step,
                    'status' => $doc->status,
                ];
            }
        }

        // Perubahan Bendahara
        $pendingTreasurers = TreasurerChange::with(['institution'])->whereIn('status', ['submitted', 'verifikasi'])->get();
        foreach ($pendingTreasurers as $doc) {
            if ($this->approvalService->canApprove($doc, 'bendahara', $user)) {
                $pendingApprovalsList[] = [
                    'id' => $doc->id,
                    'module' => 'bendahara',
                    'title' => 'Bendahara - ' . $doc->new_treasurer_name,
                    'detail' => 'Tipe: ' . ($doc->change_type === 'rekening' ? 'Rekening' : ($doc->change_type === 'bendahara' ? 'Bendahara' : 'Keduanya')),
                    'institution' => $doc->institution?->name ?? '-',
                    'reference' => $doc->reference_number,
                    'date' => $doc->created_at->toISOString(),
                    'current_step' => $doc->current_step,
                    'status' => $doc->status,
                ];
            }
        }

        // School Transfer
        $pendingTransfers = SchoolTransfer::with(['institution'])->whereIn('status', ['submitted', 'verifikasi'])->get();
        foreach ($pendingTransfers as $doc) {
            if ($this->approvalService->canApprove($doc, 'school_transfer', $user)) {
                $pendingApprovalsList[] = [
                    'id' => $doc->id,
                    'module' => 'school_transfer',
                    'title' => 'Mutasi Siswa - ' . $doc->student_name,
                    'detail' => 'Tujuan: ' . $doc->target_school . ' (Kelas ' . $doc->grade . ')',
                    'institution' => $doc->institution?->name ?? '-',
                    'reference' => $doc->transfer_number,
                    'date' => $doc->created_at->toISOString(),
                    'current_step' => $doc->current_step,
                    'status' => $doc->status,
                ];
            }
        }

        // 3. TAMU BULANAN (grafik Recharts)
        $tamuBulanan = [];
        if (!$isSekolah) {
            for ($i = 5; $i >= 0; $i--) {
                $date = now()->subMonths($i);
                $monthName = $date->translatedFormat('F');
                $count = GuestBook::query()->whereMonth('date', $date->month)
                    ->whereYear('date', $date->year)
                    ->count();
                $tamuBulanan[] = [
                    'name' => $monthName,
                    'tamu' => $count
                ];
            }
        }

        // 4. AKTIVITAS TERBARU
        $aktivitasTerbaru = [];
        if ($isSekolah) {
            $sppdActs = Sppd::query()->with('user')->where('institution_id', $institutionId)->latest()->take(3)->get();
            $ijazahActs = IjazahRevision::query()->latest()->where('institution_id', $institutionId)->take(3)->get();
            $treasurerActs = TreasurerChange::query()->latest()->where('institution_id', $institutionId)->take(3)->get();
            $transferActs = SchoolTransfer::query()->latest()->where('institution_id', $institutionId)->take(3)->get();
        } else {
            $sppdActs = Sppd::query()->with('user')->latest()->take(3)->get();
            $ijazahActs = IjazahRevision::query()->latest()->take(3)->get();
            $treasurerActs = TreasurerChange::query()->latest()->take(3)->get();
            $transferActs = SchoolTransfer::query()->latest()->take(3)->get();
        }

        foreach ($sppdActs as $item) {
            $statusLabel = $item->status === 'approved' ? 'Disetujui' : ($item->status === 'rejected' ? 'Ditolak' : 'Menunggu');
            $statusColor = $item->status === 'approved' ? 'bg-emerald-100 text-emerald-700' : ($item->status === 'rejected' ? 'bg-rose-100 text-rose-700' : 'bg-orange-100 text-orange-700');
            $aktivitasTerbaru[] = [
                'id' => $item->id,
                'title' => 'SPPD - ' . ($item->user?->name ?? 'Staff'),
                'type' => 'Manajemen SPPD',
                'status' => $statusLabel,
                'statusColor' => $statusColor,
                'time' => $item->created_at->diffForHumans(),
                'timestamp' => $item->created_at->timestamp,
            ];
        }

        foreach ($ijazahActs as $item) {
            $statusLabel = $item->status === 'approved' ? 'Disetujui' : ($item->status === 'rejected' ? 'Ditolak' : ($item->status === 'ready_for_pickup' ? 'Siap Diambil' : 'Menunggu'));
            $statusColor = $item->status === 'approved' ? 'bg-emerald-100 text-emerald-700' : ($item->status === 'rejected' ? 'bg-rose-100 text-rose-700' : 'bg-orange-100 text-orange-700');
            $aktivitasTerbaru[] = [
                'id' => $item->id,
                'title' => 'Revisi Ijazah - ' . $item->student_name,
                'type' => 'Revisi Ijazah',
                'status' => $statusLabel,
                'statusColor' => $statusColor,
                'time' => $item->created_at->diffForHumans(),
                'timestamp' => $item->created_at->timestamp,
            ];
        }

        foreach ($treasurerActs as $item) {
            $statusLabel = $item->status === 'approved' ? 'Disetujui' : ($item->status === 'rejected' ? 'Ditolak' : 'Menunggu');
            $statusColor = $item->status === 'approved' ? 'bg-emerald-100 text-emerald-700' : ($item->status === 'rejected' ? 'bg-rose-100 text-rose-700' : 'bg-orange-100 text-orange-700');
            $aktivitasTerbaru[] = [
                'id' => $item->id,
                'title' => 'Bendahara - ' . $item->new_treasurer_name,
                'type' => 'Perubahan Bendahara',
                'status' => $statusLabel,
                'statusColor' => $statusColor,
                'time' => $item->created_at->diffForHumans(),
                'timestamp' => $item->created_at->timestamp,
            ];
        }

        foreach ($transferActs as $item) {
            $statusLabel = $item->status === 'approved' ? 'Disetujui' : ($item->status === 'rejected' ? 'Ditolak' : 'Menunggu');
            $statusColor = $item->status === 'approved' ? 'bg-emerald-100 text-emerald-700' : ($item->status === 'rejected' ? 'bg-rose-100 text-rose-700' : 'bg-orange-100 text-orange-700');
            $aktivitasTerbaru[] = [
                'id' => $item->id,
                'title' => 'Mutasi Siswa - ' . $item->student_name,
                'type' => 'Pindah Sekolah',
                'status' => $statusLabel,
                'statusColor' => $statusColor,
                'time' => $item->created_at->diffForHumans(),
                'timestamp' => $item->created_at->timestamp,
            ];
        }

        usort($aktivitasTerbaru, function($a, $b) {
            return $b['timestamp'] <=> $a['timestamp'];
        });
        $aktivitasTerbaru = array_slice($aktivitasTerbaru, 0, 5);

        // 5. FEED BERITA TERBARU
        $newsFeed = Article::with('category')->published()
            ->latest()
            ->take(3)
            ->get()
            ->map(function($article) {
                return [
                    'id' => $article->id,
                    'category' => $article->category?->name ?? 'Pengumuman',
                    'date' => $article->created_at->diffForHumans(),
                    'title' => $article->title,
                    'excerpt' => $article->excerpt ?? (strip_tags(substr($article->content, 0, 120)) . '...'),
                    'slug' => $article->slug,
                ];
            });

        return response()->json([
            'stats' => $stats,
            'antrian_pending' => $pendingApprovalsList,
            'tamu_bulanan' => $tamuBulanan,
            'aktivitas_terbaru' => $aktivitasTerbaru,
            'news_feed' => $newsFeed,
            'user' => [
                'name' => $user->name,
                'role' => $user->roles->pluck('name')->first(),
                'is_sekolah' => $isSekolah
            ]
        ]);
    }
}

