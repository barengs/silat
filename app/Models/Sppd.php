<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Sppd extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'document_number',
        'user_id',
        'institution_id',
        'submitter_type',
        'destination',
        'purpose',
        'base_letter',
        'start_date',
        'end_date',
        'transport_type_id',
        'budget_source',
        'estimated_budget',
        'actual_budget',
        'status',
        'current_step',
        'document_path',
        'rejection_note',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'estimated_budget' => 'decimal:2',
        'actual_budget' => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function institution(): BelongsTo
    {
        return $this->belongsTo(Institution::class);
    }

    public function transportType(): BelongsTo
    {
        return $this->belongsTo(TransportType::class);
    }

    public function members(): HasMany
    {
        return $this->hasMany(SppdMember::class);
    }

    public function report(): HasOne
    {
        return $this->hasOne(SppdReport::class);
    }

    public function approvals(): MorphMany
    {
        return $this->morphMany(DocumentApproval::class, 'document');
    }

    /**
     * Get the current/latest approval record.
     */
    public function currentApproval()
    {
        return $this->approvals()->where('step_order', $this->current_step)->first();
    }

    /**
     * Check if this SPPD has an unfinished previous report (blocks new SPPD submission).
     */
    public static function hasUnreportedSppd(int $userId): bool
    {
        return static::where('user_id', $userId)
            ->whereIn('status', ['active', 'approved'])
            ->whereDoesntHave('report')
            ->where('end_date', '<', now())
            ->exists();
    }

    /**
     * Check for date conflict with existing SPPD for the same user.
     */
    public static function hasConflict(int $userId, string $startDate, string $endDate, ?int $excludeId = null): bool
    {
        return static::where('user_id', $userId)
            ->whereNotIn('status', ['draft', 'rejected', 'closed'])
            ->when($excludeId, fn ($q) => $q->where('id', '!=', $excludeId))
            ->where(function ($q) use ($startDate, $endDate) {
                $q->whereBetween('start_date', [$startDate, $endDate])
                    ->orWhereBetween('end_date', [$startDate, $endDate])
                    ->orWhere(function ($q2) use ($startDate, $endDate) {
                        $q2->where('start_date', '<=', $startDate)
                            ->where('end_date', '>=', $endDate);
                    });
            })
            ->exists();
    }

    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    public function scopePending($query)
    {
        return $query->whereIn('status', ['submitted', 'verifikasi']);
    }
}
