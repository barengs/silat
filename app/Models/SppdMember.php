<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SppdMember extends Model
{
    protected $fillable = ['sppd_id', 'user_id', 'member_name', 'member_nip', 'role_in_trip'];

    protected $appends = ['display_name', 'display_nip'];

    public function sppd(): BelongsTo
    {
        return $this->belongsTo(Sppd::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Nama tampilan: gunakan nama dari relasi user jika ada, fallback ke member_name manual.
     */
    public function getDisplayNameAttribute(): string
    {
        return $this->user?->name ?? $this->member_name ?? '-';
    }

    /**
     * NIP tampilan: gunakan NIP dari relasi user jika ada, fallback ke member_nip manual.
     */
    public function getDisplayNipAttribute(): ?string
    {
        return $this->user?->nip ?? $this->member_nip;
    }
}
