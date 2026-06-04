<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Division;
use Illuminate\Http\Request;

class DivisionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Division::query()->with('parent');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where('name', 'like', "%{$search}%")
                ->orWhere('code', 'like', "%{$search}%");
        }

        if ($request->has('is_active')) {
            $query->where('is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN));
        }

        // Parent filter
        if ($request->has('parent_id')) {
            if (empty($request->parent_id)) {
                $query->whereNull('parent_id');
            } else {
                $query->where('parent_id', $request->parent_id);
            }
        }

        $perPage = (int) ($request->per_page ?? 10);
        $divisions = $query->orderBy('sort_order', 'asc')->orderBy('name', 'asc')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $divisions,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50|unique:divisions,code',
            'description' => 'nullable|string',
            'parent_id' => 'nullable|exists:divisions,id',
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ]);

        $division = Division::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Divisi/Bidang berhasil ditambahkan',
            'data' => $division,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Division $division)
    {
        $division->load('parent', 'children');

        return response()->json([
            'success' => true,
            'data' => $division,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Division $division)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50|unique:divisions,code,'.$division->id,
            'description' => 'nullable|string',
            'parent_id' => 'nullable|exists:divisions,id|not_in:'.$division->id, // prevent self-parenting
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ]);

        $division->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Divisi/Bidang berhasil diperbarui',
            'data' => $division,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Division $division)
    {
        if ($division->children()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak dapat menghapus divisi ini karena memiliki sub-divisi.',
            ], 400);
        }

        try {
            Division::destroy($division->id);

            return response()->json([
                'success' => true,
                'message' => 'Divisi/Bidang berhasil dihapus',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus divisi, kemungkinan karena data terkait (seperti pengguna atau buku tamu).',
            ], 500);
        }
    }
}
