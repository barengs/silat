<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Institution;
use Illuminate\Http\Request;

class InstitutionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Institution::query();

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('npsn', 'like', "%{$search}%")
                  ->orWhere('city', 'like', "%{$search}%");
            });
        }

        if ($request->has('is_active')) {
            $query->where('is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN));
        }

        $perPage = (int) ($request->per_page ?? 10);
        $institutions = $query->orderBy('name', 'asc')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data'    => $institutions,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'      => 'required|string|max:255',
            'type'      => 'required|in:dinas,cabdin,sekolah_sma,sekolah_smk,sekolah_pkplk,other',
            'npsn'      => 'nullable|string|max:20|unique:institutions,npsn',
            'address'   => 'nullable|string',
            'city'      => 'nullable|string|max:100',
            'province'  => 'nullable|string|max:100',
            'phone'     => 'nullable|string|max:50',
            'email'     => 'nullable|email|max:255',
            'website'   => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        $institution = Institution::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Instansi berhasil ditambahkan',
            'data'    => $institution,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Institution $institution)
    {
        return response()->json([
            'success' => true,
            'data'    => $institution,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Institution $institution)
    {
        $validated = $request->validate([
            'name'      => 'required|string|max:255',
            'type'      => 'required|in:dinas,cabdin,sekolah_sma,sekolah_smk,sekolah_pkplk,other',
            'npsn'      => 'nullable|string|max:20|unique:institutions,npsn,' . $institution->id,
            'address'   => 'nullable|string',
            'city'      => 'nullable|string|max:100',
            'province'  => 'nullable|string|max:100',
            'phone'     => 'nullable|string|max:50',
            'email'     => 'nullable|email|max:255',
            'website'   => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        $institution->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Instansi berhasil diperbarui',
            'data'    => $institution,
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
}
