<?php

namespace App\Http\Controllers\Api;

use App\Exports\GuestBookExport;
use App\Http\Controllers\Controller;
use App\Models\GuestAgency;
use App\Models\GuestBook;
use App\Models\User;
use App\Notifications\GuestArrivalNotification;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Maatwebsite\Excel\Facades\Excel;

class GuestBookController extends Controller
{
    /**
     * Display a listing of the resource and summary stats.
     */
    public function index(Request $request)
    {
        $query = GuestBook::with(['agency', 'targetDivision', 'registeredBy'])
            ->orderBy('created_at', 'desc');

        $startDate = $request->start_date ? Carbon::parse($request->start_date)->startOfDay() : Carbon::today();
        $endDate = $request->end_date ? Carbon::parse($request->end_date)->endOfDay() : Carbon::today()->endOfDay();

        $query->whereBetween('date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')]);

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('guest_name', 'like', "%{$search}%")
                    ->orWhereHas('agency', function ($q2) use ($search) {
                        $q2->where('name', 'like', "%{$search}%");
                    });
            });
        }

        // Statistics based on the selected date range
        $totalInRange = GuestBook::whereBetween('date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')])->count();

        $mostVisitedAgency = GuestBook::whereBetween('date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')])
            ->whereNotNull('guest_agency_id')
            ->select('guest_agency_id', DB::raw('count(*) as total'))
            ->groupBy('guest_agency_id')
            ->orderBy('total', 'desc')
            ->with('agency')
            ->first();

        $mainTargetDivision = GuestBook::whereBetween('date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')])
            ->select('target_division_id', DB::raw('count(*) as total'))
            ->groupBy('target_division_id')
            ->orderBy('total', 'desc')
            ->with('targetDivision')
            ->first();

        $stats = [
            'total_today' => $totalInRange,
            'most_visited_agency' => $mostVisitedAgency ? $mostVisitedAgency->agency->name : '-',
            'main_target_division' => $mainTargetDivision ? $mainTargetDivision->targetDivision->name : '-',
        ];

        return response()->json([
            'data' => $query->paginate($request->per_page ?? 10),
            'stats' => $stats,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'guest_name' => 'required|string|max:255',
            'agency_name' => 'nullable|string|max:255',
            'target_division_id' => 'required|exists:divisions,id',
            'purpose' => 'required|string',
            'guest_contact' => 'nullable|string|max:20',
        ]);

        try {
            DB::beginTransaction();

            $agencyId = null;
            if (! empty($validated['agency_name'])) {
                $agency = GuestAgency::firstOrCreate(
                    ['name' => $validated['agency_name']]
                );
                $agencyId = $agency->id;
            }

            $guestBook = GuestBook::create([
                'date' => Carbon::today(),
                'check_in_time' => Carbon::now()->format('H:i:s'),
                'guest_name' => $validated['guest_name'],
                'guest_contact' => $validated['guest_contact'],
                'purpose' => $validated['purpose'],
                'guest_agency_id' => $agencyId,
                'target_division_id' => $validated['target_division_id'],
                'registered_by' => request()->user()->id ?? null,
            ]);

            // Send notification to users in target division
            $targetUsers = User::where('division_id', $validated['target_division_id'])->active()->get();
            if ($targetUsers->isNotEmpty()) {
                Notification::send($targetUsers, new GuestArrivalNotification($guestBook));
            }

            DB::commit();

            return response()->json([
                'message' => 'Data tamu berhasil disimpan.',
                'data' => $guestBook,
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json(['message' => 'Terjadi kesalahan saat menyimpan data tamu.', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Search guest agencies for autocomplete.
     */
    public function searchAgencies(Request $request)
    {
        $search = $request->search;
        $agencies = GuestAgency::when($search, function ($query, $search) {
            return $query->where('name', 'like', "%{$search}%");
        })->limit(10)->get();

        return response()->json(['data' => $agencies]);
    }

    /**
     * Export guest book data to Excel.
     */
    public function export(Request $request)
    {
        $startDate = $request->start_date ? Carbon::parse($request->start_date) : null;
        $endDate = $request->end_date ? Carbon::parse($request->end_date) : null;

        $filename = 'buku_tamu_'.now()->format('Ymd_His').'.xlsx';

        return Excel::download(new GuestBookExport($startDate, $endDate), $filename);
    }

    /**
     * Generate chart report data.
     */
    public function report(Request $request)
    {
        $startDate = $request->start_date ? Carbon::parse($request->start_date)->startOfDay() : Carbon::now()->subDays(30)->startOfDay();
        $endDate = $request->end_date ? Carbon::parse($request->end_date)->endOfDay() : Carbon::now()->endOfDay();

        // 1. Trend Kunjungan Harian (Line Chart)
        $dailyTrend = GuestBook::whereBetween('date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')])
            ->select('date', DB::raw('count(*) as total'))
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();

        // 2. Kunjungan per Divisi (Bar/Pie Chart)
        $divisionStats = GuestBook::whereBetween('date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')])
            ->select('target_division_id', DB::raw('count(*) as total'))
            ->groupBy('target_division_id')
            ->with('targetDivision')
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->targetDivision ? $item->targetDivision->name : 'Lainnya',
                    'value' => $item->total,
                ];
            });

        return response()->json([
            'daily_trend' => $dailyTrend,
            'division_stats' => $divisionStats,
        ]);
    }
}
