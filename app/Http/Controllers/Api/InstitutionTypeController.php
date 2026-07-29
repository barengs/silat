<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InstitutionType;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class InstitutionTypeController extends Controller
{
    /**
     * Display a listing of institution types.
     */
    public function index(Request $request)
    {
        $query = InstitutionType::query();

        if ($request->has('is_active')) {
            $query->where('is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN));
        }

        $types = $query->orderBy('name', 'asc')->get();

        return response()->json([
            'success' => true,
            'data' => $types,
        ]);
    }

    /**
     * Store a newly created institution type.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'group' => 'required|in:dinas,sekolah,external',
            'school_level' => 'nullable|string|max:10',
            'is_active' => 'boolean',
        ]);

        $validated['code'] = Str::slug($validated['name'], '_');

        // Check if code already exists
        if (InstitutionType::where('code', $validated['code'])->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Tipe instansi dengan nama serupa sudah ada.',
            ], 422);
        }

        $type = InstitutionType::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Tipe instansi berhasil ditambahkan.',
            'data' => $type,
        ], 201);
    }

    /**
     * Update the specified institution type.
     */
    public function update(Request $request, $id)
    {
        $type = InstitutionType::findOrFail($id);

        // Core system types shouldn't be edited or deactivated to prevent system failure
        if (in_array($type->code, ['dinas', 'cabdin', 'sekolah_sma', 'sekolah_smk', 'sekolah_pkplk', 'other'])) {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
            ]);
        } else {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'group' => 'required|in:dinas,sekolah,external',
                'school_level' => 'nullable|string|max:10',
                'is_active' => 'boolean',
            ]);
            $validated['code'] = Str::slug($validated['name'], '_');

            // Check duplicate code excluding current type
            if (InstitutionType::where('code', $validated['code'])->where('id', '!=', $id)->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tipe instansi dengan nama serupa sudah ada.',
                ], 422);
            }
        }

        $type->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Tipe instansi berhasil diperbarui.',
            'data' => $type,
        ]);
    }

    /**
     * Remove the specified institution type.
     */
    public function destroy($id)
    {
        $type = InstitutionType::findOrFail($id);

        if (in_array($type->code, ['dinas', 'cabdin', 'sekolah_sma', 'sekolah_smk', 'sekolah_pkplk', 'other'])) {
            return response()->json([
                'success' => false,
                'message' => 'Tipe instansi sistem (core) tidak dapat dihapus.',
            ], 403);
        }

        // Check if there are institutions associated with this type
        if ($type->institutions()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak dapat menghapus tipe instansi ini karena masih digunakan oleh beberapa instansi.',
            ], 422);
        }

        $type->delete();

        return response()->json([
            'success' => true,
            'message' => 'Tipe instansi berhasil dihapus.',
        ]);
    }
}
