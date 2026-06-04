<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ArticleCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ArticleCategoryController extends Controller
{
    /**
     * Get list of categories.
     */
    public function index(Request $request)
    {
        $query = ArticleCategory::query();

        if ($request->has('active_only') && $request->active_only == 'true') {
            $query->where('is_active', true);
        }

        $categories = $query->orderBy('sort_order', 'asc')->get();

        return response()->json($categories);
    }

    /**
     * Store a new category.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100|unique:article_categories,name',
            'color' => 'nullable|string|max:20',
            'icon' => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'sort_order' => 'nullable|integer',
            'is_active' => 'boolean',
        ]);

        $category = ArticleCategory::create([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
            'color' => $validated['color'] ?? '#3b82f6',
            'icon' => $validated['icon'] ?? 'info',
            'description' => $validated['description'] ?? null,
            'sort_order' => $validated['sort_order'] ?? 0,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return response()->json([
            'message' => 'Kategori berita berhasil ditambahkan.',
            'data' => $category,
        ], 201);
    }

    /**
     * Update category.
     */
    public function update(Request $request, $id)
    {
        $category = ArticleCategory::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:100|unique:article_categories,name,'.$category->id,
            'color' => 'nullable|string|max:20',
            'icon' => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'sort_order' => 'nullable|integer',
            'is_active' => 'boolean',
        ]);

        $category->update([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
            'color' => $validated['color'] ?? $category->color,
            'icon' => $validated['icon'] ?? $category->icon,
            'description' => $validated['description'] ?? $category->description,
            'sort_order' => $validated['sort_order'] ?? $category->sort_order,
            'is_active' => $validated['is_active'] ?? $category->is_active,
        ]);

        return response()->json([
            'message' => 'Kategori berita berhasil diperbarui.',
            'data' => $category,
        ]);
    }

    /**
     * Delete category.
     */
    public function destroy($id)
    {
        $category = ArticleCategory::findOrFail($id);

        // Check if there are articles linked
        if ($category->articles()->exists()) {
            return response()->json([
                'message' => 'Kategori ini tidak dapat dihapus karena masih digunakan oleh berita/pengumuman.',
            ], 422);
        }

        $category->delete();

        return response()->json([
            'message' => 'Kategori berita berhasil dihapus.',
        ]);
    }
}
