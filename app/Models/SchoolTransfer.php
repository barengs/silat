<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class SchoolTransfer extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'transfer_number',
        'institution_id',
        'student_name',
        'nisn',
        'gender',
        'grade',
        'target_school',
        'target_school_address',
        'reason',
        'file_request_letter',
        'file_report_card',
        'file_mutation_letter',
        'file_additional',
        'status',
        'current_step',
        'recommendation_letter_path',
        'submitted_by',
        'submitted_at',
        'approved_at',
    ];

    protected $casts = [
        'submitted_at' => 'datetime',
        'approved_at' => 'datetime',
    ];

    public function institution(): BelongsTo
    {
        return $this->belongsTo(Institution::class);
    }

    public function submittedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }

    public function approvals(): MorphMany
    {
        return $this->morphMany(DocumentApproval::class, 'document');
    }

    /**
     * Generate a unique transfer number: TRF-YYYYMM-NNN
     */
    public static function generateTransferNumber(): string
    {
        $prefix = 'TRF-' . now()->format('Ymd');
        $lastTransfer = static::where('transfer_number', 'like', $prefix . '%')
            ->orderBy('transfer_number', 'desc')
            ->first();

        $sequence = $lastTransfer
            ? (int) substr($lastTransfer->transfer_number, -3) + 1
            : 1;

        return $prefix . '-' . str_pad($sequence, 3, '0', STR_PAD_LEFT);
    }

    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }
}
