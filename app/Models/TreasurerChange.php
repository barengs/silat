<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class TreasurerChange extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'reference_number',
        'institution_id',
        'old_treasurer_name',
        'old_bank_account',
        'old_npwp',
        'new_treasurer_name',
        'new_bank_account',
        'new_npwp',
        'bank_name',
        'bank_branch',
        'change_type',
        'file_sk_kepsek',
        'file_ktp_npwp',
        'file_additional',
        'status',
        'current_step',
        'verifier_note',
        'recommendation_letter_path',
        'submitted_by',
        'submitted_at',
        'approved_at',
        'document_generated_at',
    ];

    protected $casts = [
        'submitted_at'          => 'datetime',
        'approved_at'           => 'datetime',
        'document_generated_at' => 'datetime',
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
     * Generate a unique reference number: BND-YYYYMM-NNN
     */
    public static function generateReferenceNumber(): string
    {
        $prefix = 'BND-' . now()->format('Ym');
        $lastRef = static::where('reference_number', 'like', $prefix . '%')
            ->orderBy('reference_number', 'desc')
            ->first();

        $sequence = $lastRef
            ? (int) substr($lastRef->reference_number, -3) + 1
            : 1;

        return $prefix . '-' . str_pad($sequence, 3, '0', STR_PAD_LEFT);
    }

    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }
}
