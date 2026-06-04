<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Article;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ArticleController extends Controller
{
    /**
     * Get list of articles for Admin (protected).
     */
    public function index(Request $request)
    {
        $query = Article::with(['category', 'author']);

        if ($request->has('q') && $request->q !== '') {
            $query->where('title', 'like', '%'.$request->q.'%');
        }

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $articles = $query->latest('published_at')->paginate(10);

        return response()->json($articles);
    }

    /**
     * Store new article.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category_id' => 'required|exists:article_categories,id',
            'excerpt' => 'nullable|string',
            'content' => 'required|string',
            'thumbnail' => 'nullable|image|max:2048',
            'status' => 'required|in:draft,published,archived',
            'is_pinned' => 'boolean',
            'is_public' => 'boolean',
            'published_at' => 'nullable|date',
        ]);

        $thumbnailPath = null;
        if ($request->hasFile('thumbnail')) {
            $thumbnailPath = $request->file('thumbnail')->store('articles', 'public');
        }

        $article = Article::create([
            'user_id' => $request->user()->id,
            'category_id' => $validated['category_id'],
            'title' => $validated['title'],
            'slug' => Str::slug($validated['title']).'-'.uniqid(),
            'excerpt' => $validated['excerpt'],
            'content' => $validated['content'],
            'thumbnail_path' => $thumbnailPath,
            'status' => $validated['status'],
            'is_pinned' => $validated['is_pinned'] ?? false,
            'is_public' => $validated['is_public'] ?? true,
            'published_at' => $validated['published_at'] ?? ($validated['status'] === 'published' ? now() : null),
        ]);

        return response()->json(['message' => 'Berita berhasil ditambahkan.', 'data' => $article], 201);
    }

    /**
     * Show single article.
     */
    public function show($id)
    {
        $article = Article::with(['category', 'author'])->findOrFail($id);

        return response()->json($article);
    }

    /**
     * Update article.
     */
    public function update(Request $request, $id)
    {
        $article = Article::findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category_id' => 'required|exists:article_categories,id',
            'excerpt' => 'nullable|string',
            'content' => 'required|string',
            'thumbnail' => 'nullable|image|max:2048',
            'status' => 'required|in:draft,published,archived',
            'is_pinned' => 'boolean',
            'is_public' => 'boolean',
            'published_at' => 'nullable|date',
        ]);

        if ($request->hasFile('thumbnail')) {
            if ($article->thumbnail_path) {
                Storage::disk('public')->delete($article->thumbnail_path);
            }
            $article->thumbnail_path = $request->file('thumbnail')->store('articles', 'public');
        }

        $article->update([
            'category_id' => $validated['category_id'],
            'title' => $validated['title'],
            'excerpt' => $validated['excerpt'],
            'content' => $validated['content'],
            'status' => $validated['status'],
            'is_pinned' => $validated['is_pinned'] ?? false,
            'is_public' => $validated['is_public'] ?? true,
            'published_at' => $validated['published_at'] ?? ($validated['status'] === 'published' && ! $article->published_at ? now() : $article->published_at),
        ]);

        return response()->json(['message' => 'Berita berhasil diperbarui.', 'data' => $article]);
    }

    /**
     * Delete article.
     */
    public function destroy($id)
    {
        $article = Article::findOrFail($id);

        if ($article->thumbnail_path) {
            Storage::disk('public')->delete($article->thumbnail_path);
        }

        $article->delete();

        return response()->json(['message' => 'Berita berhasil dihapus.']);
    }

    /**
     * Public Endpoint: Get latest published articles for Landing Page.
     */
    public function indexPublic(Request $request)
    {
        $articles = Article::with(['category:id,name', 'author:id,name,photo_path'])
            ->published()
            ->public()
            ->orderBy('is_pinned', 'desc')
            ->orderBy('published_at', 'desc')
            ->paginate(6);

        return response()->json($articles);
    }

    /**
     * Public Endpoint: Show single article by slug.
     */
    public function showPublic($slug)
    {
        $article = Article::with(['category:id,name', 'author:id,name,photo_path'])
            ->published()
            ->public()
            ->where('slug', $slug)
            ->firstOrFail();

        $article->incrementView();

        return response()->json($article);
    }
}
