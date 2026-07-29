<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Institution extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'type',
        'name',
        'npsn_code',
        'nss_code',
        'school_level',
        'address',
        'village',
        'district',
        'city',
        'province',
        'postal_code',
        'phone',
        'email',
        'principal_name',
        'is_active',
        'institution_type_id',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Users that belong to this institution.
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    /**
     * Get the type details for this institution.
     */
    public function institutionType(): BelongsTo
    {
        return $this->belongsTo(InstitutionType::class, 'institution_type_id');
    }

    /**
     * SPPD submissions from this institution.
     */
    public function sppds(): HasMany
    {
        return $this->hasMany(Sppd::class);
    }

    /**
     * Ijazah revision requests from this institution.
     */
    public function ijazahRevisions(): HasMany
    {
        return $this->hasMany(IjazahRevision::class);
    }

    /**
     * Treasurer change requests from this institution.
     */
    public function treasurerChanges(): HasMany
    {
        return $this->hasMany(TreasurerChange::class);
    }

    /**
     * Scope: only sekolah type institutions.
     */
    public function scopeSekolah($query)
    {
        return $query->where('type', 'sekolah');
    }

    /**
     * Scope: only active institutions.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
