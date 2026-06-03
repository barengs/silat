<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ArticleCategory extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'color',
        'icon',
        'description',
        'sort_order',
        'is_active',
    ];

    protected $casts = ['is_active' => 'boolean'];

    public function articles(): HasMany
    {
        return $this->hasMany(Article::class, 'category_id');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true)->orderBy('sort_order');
    }
}
