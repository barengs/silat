<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SppdMember extends Model
{
    protected $fillable = ['sppd_id', 'user_id', 'role_in_trip'];

    public function sppd(): BelongsTo
    {
        return $this->belongsTo(Sppd::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
