<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Division extends Model
{
    protected $fillable = [
        'name',
        'code',
        'description',
        'parent_id',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Parent division (for sub-divisions).
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Division::class, 'parent_id');
    }

    /**
     * Child divisions.
     */
    public function children(): HasMany
    {
        return $this->hasMany(Division::class, 'parent_id');
    }

    /**
     * Staff users in this division.
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    /**
     * Guest book entries targeting this division.
     */
    public function guestBooks(): HasMany
    {
        return $this->hasMany(GuestBook::class, 'target_division_id');
    }

    /**
     * Scope: only top-level (no parent) divisions.
     */
    public function scopeTopLevel($query)
    {
        return $query->whereNull('parent_id');
    }

    /**
     * Scope: only active divisions.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true)->orderBy('sort_order');
    }
}
