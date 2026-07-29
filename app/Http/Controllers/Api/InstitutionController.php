<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Institution;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\InstitutionTemplateExport;
use App\Imports\InstitutionImport;

class InstitutionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Institution::with('institutionType');

        if ($request->has('type')) {
            $type = $request->type;
            $instType = \App\Models\InstitutionType::where('code', $type)->first();
            if ($instType) {
                $query->where('institution_type_id', $instType->id);
            } else {
                if ($type === 'sekolah_sma') {
                    $query->where('type', 'sekolah')->where('school_level', 'SMA');
                } elseif ($type === 'sekolah_smk') {
                    $query->where('type', 'sekolah')->where('school_level', 'SMK');
                } elseif ($type === 'sekolah_pkplk') {
                    $query->where('type', 'sekolah')->where('school_level', 'SLB');
                } elseif ($type === 'dinas') {
                    $query->where('type', 'dinas');
                } elseif ($type === 'cabdin' || $type === 'other') {
                    $query->where('type', 'external');
                } else {
                    $query->where('type', $type);
                }
            }
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('npsn_code', 'like', "%{$search}%")
                    ->orWhere('city', 'like', "%{$search}%");
            });
        }

        if ($request->has('is_active')) {
            $query->where('is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN));
        }

        $perPage = (int) ($request->per_page ?? 10);
        $institutions = $query->orderBy('name', 'asc')->paginate($perPage);

        // Map fields for frontend compatibility
        $institutions->getCollection()->transform(function ($item) {
            $item->npsn = $item->npsn_code;
            if ($item->institutionType) {
                $item->type = $item->institutionType->code;
            } else {
                if ($item->type === 'sekolah') {
                    if ($item->school_level === 'SMK') {
                        $item->type = 'sekolah_smk';
                    } elseif ($item->school_level === 'SLB') {
                        $item->type = 'sekolah_pkplk';
                    } else {
                        $item->type = 'sekolah_sma';
                    }
                } elseif ($item->type === 'external') {
                    $item->type = 'cabdin';
                }
            }
            return $item;
        });

        return response()->json([
            'success' => true,
            'data' => $institutions,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|max:100',
            'npsn' => 'nullable|string|max:20|unique:institutions,npsn_code',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'province' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'website' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        $dbData = $validated;
        $dbData['npsn_code'] = $validated['npsn'] ?? null;
        unset($dbData['npsn']);

        $frontendType = $validated['type'];
        $instType = \App\Models\InstitutionType::where('code', $frontendType)->first();

        if ($instType) {
            $dbData['institution_type_id'] = $instType->id;
            $dbData['type'] = $instType->group;
            $dbData['school_level'] = $instType->school_level;
        } else {
            if ($frontendType === 'sekolah_sma') {
                $dbData['type'] = 'sekolah';
                $dbData['school_level'] = 'SMA';
            } elseif ($frontendType === 'sekolah_smk') {
                $dbData['type'] = 'sekolah';
                $dbData['school_level'] = 'SMK';
            } elseif ($frontendType === 'sekolah_pkplk') {
                $dbData['type'] = 'sekolah';
                $dbData['school_level'] = 'SLB';
            } elseif ($frontendType === 'dinas') {
                $dbData['type'] = 'dinas';
                $dbData['school_level'] = null;
            } else {
                $dbData['type'] = 'external';
                $dbData['school_level'] = null;
            }
        }

        $institution = Institution::create($dbData);

        $institution->npsn = $institution->npsn_code;
        $institution->type = $frontendType;

        return response()->json([
            'success' => true,
            'message' => 'Instansi berhasil ditambahkan',
            'data' => $institution,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Institution $institution)
    {
        $institution->load('institutionType');
        $institution->npsn = $institution->npsn_code;
        if ($institution->institutionType) {
            $institution->type = $institution->institutionType->code;
        } else {
            if ($institution->type === 'sekolah') {
                if ($institution->school_level === 'SMK') {
                    $institution->type = 'sekolah_smk';
                } elseif ($institution->school_level === 'SLB') {
                    $institution->type = 'sekolah_pkplk';
                } else {
                    $institution->type = 'sekolah_sma';
                }
            } elseif ($institution->type === 'external') {
                $institution->type = 'cabdin';
            }
        }

        return response()->json([
            'success' => true,
            'data' => $institution,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Institution $institution)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|max:100',
            'npsn' => 'nullable|string|max:20|unique:institutions,npsn_code,'.$institution->id,
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'province' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'website' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        $dbData = $validated;
        $dbData['npsn_code'] = $validated['npsn'] ?? null;
        unset($dbData['npsn']);

        $frontendType = $validated['type'];
        $instType = \App\Models\InstitutionType::where('code', $frontendType)->first();

        if ($instType) {
            $dbData['institution_type_id'] = $instType->id;
            $dbData['type'] = $instType->group;
            $dbData['school_level'] = $instType->school_level;
        } else {
            if ($frontendType === 'sekolah_sma') {
                $dbData['type'] = 'sekolah';
                $dbData['school_level'] = 'SMA';
            } elseif ($frontendType === 'sekolah_smk') {
                $dbData['type'] = 'sekolah';
                $dbData['school_level'] = 'SMK';
            } elseif ($frontendType === 'sekolah_pkplk') {
                $dbData['type'] = 'sekolah';
                $dbData['school_level'] = 'SLB';
            } elseif ($frontendType === 'dinas') {
                $dbData['type'] = 'dinas';
                $dbData['school_level'] = null;
            } else {
                $dbData['type'] = 'external';
                $dbData['school_level'] = null;
            }
        }

        $institution->update($dbData);

        $institution->npsn = $institution->npsn_code;
        $institution->type = $frontendType;

        return response()->json([
            'success' => true,
            'message' => 'Instansi berhasil diperbarui',
            'data' => $institution,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Institution $institution)
    {
        // Simple check to prevent deleting the core dinas institution
        if ($institution->type === 'dinas' || $institution->id === 1) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak dapat menghapus instansi pusat/dinas.',
            ], 403);
        }

        try {
            Institution::destroy($institution->id);

            return response()->json([
                'success' => true,
                'message' => 'Instansi berhasil dihapus',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus instansi, kemungkinan karena data terkait.',
            ], 500);
        }
    }

    /**
     * Download CSV/Excel template for import.
     */
    public function template()
    {
        return Excel::download(new InstitutionTemplateExport, 'template_import_instansi.xlsx');
    }

    /**
     * Import instances from Excel/CSV.
     */
    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv,txt|max:5120'
        ]);

        $import = new InstitutionImport;
        Excel::import($import, $request->file('file'));

        return response()->json([
            'success' => true,
            'message' => "Berhasil mengimpor {$import->importedCount} instansi.",
        ]);
    }
}
