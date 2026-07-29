<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GuestBook extends Model
{
    protected $fillable = [
        'date',
        'check_in_time',
        'check_out_time',
        'guest_name',
        'guest_contact',
        'guest_position',
        'purpose',
        'guest_agency_id',
        'target_division_id',
        'registered_by',
        'notes',
        'status',
    ];

    protected $casts = [
        'date' => 'date',
    ];

    public function agency(): BelongsTo
    {
        return $this->belongsTo(GuestAgency::class, 'guest_agency_id');
    }

    public function targetDivision(): BelongsTo
    {
        return $this->belongsTo(Division::class, 'target_division_id');
    }

    public function registeredBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'registered_by');
    }

    /**
     * Scope: filter by date range.
     */
    public function scopeDateBetween($query, string $from, string $to)
    {
        return $query->whereBetween('date', [$from, $to]);
    }

    /**
     * Scope: today's guests.
     */
    public function scopeToday($query)
    {
        return $query->where('date', today());
    }
}
