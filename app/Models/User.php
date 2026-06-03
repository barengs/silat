<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;
use Tymon\JWTAuth\Contracts\JWTSubject;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class User extends Authenticatable implements JWTSubject
{
    use HasFactory, Notifiable, HasRoles, SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'password',
        'institution_id',
        'division_id',
        'nip',
        'phone',
        'photo_path',
        'signature_image_path',
        'is_active',
        'last_login_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login_at'     => 'datetime',
            'password'          => 'hashed',
            'is_active'         => 'boolean',
        ];
    }

    // ─── JWT Interface Methods ────────────────────────────────────────────────

    /**
     * Get the identifier that will be stored in the subject claim of the JWT.
     */
    public function getJWTIdentifier(): mixed
    {
        return $this->getKey();
    }

    /**
     * Return a key value array, containing any custom claims to be added to the JWT.
     */
    public function getJWTCustomClaims(): array
    {
        return [
            'name'           => $this->name,
            'email'          => $this->email,
            'institution_id' => $this->institution_id,
            'division_id'    => $this->division_id,
        ];
    }

    // ─── Relationships ────────────────────────────────────────────────────────

    public function institution(): BelongsTo
    {
        return $this->belongsTo(Institution::class);
    }

    public function division(): BelongsTo
    {
        return $this->belongsTo(Division::class);
    }

    public function sppds(): HasMany
    {
        return $this->hasMany(Sppd::class);
    }

    public function articles(): HasMany
    {
        return $this->hasMany(Article::class);
    }

    public function documentApprovals(): HasMany
    {
        return $this->hasMany(DocumentApproval::class);
    }

    // ─── Helper Methods ───────────────────────────────────────────────────────

    /**
     * Check if user belongs to dinas (not a school operator).
     */
    public function isDinas(): bool
    {
        return $this->institution?->type === 'dinas' || $this->institution === null;
    }

    /**
     * Check if user belongs to a school.
     */
    public function isSekolah(): bool
    {
        return $this->institution?->type === 'sekolah';
    }

    /**
     * Get full display name with NIP.
     */
    public function getDisplayNameAttribute(): string
    {
        return $this->nip
            ? "{$this->name} ({$this->nip})"
            : $this->name;
    }

    /**
     * Scope: only active users.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope: filter by division.
     */
    public function scopeInDivision($query, int $divisionId)
    {
        return $query->where('division_id', $divisionId);
    }
}
