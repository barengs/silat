<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InstitutionType extends Model
{
    protected $fillable = [
        'name',
        'code',
        'group',
        'school_level',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Institutions that belong to this type.
     */
    public function institutions(): HasMany
    {
        return $this->hasMany(Institution::class);
    }
}
