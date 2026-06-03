<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class IjazahRevision extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'ticket_number',
        'institution_id',
        'student_name',
        'nisn',
        'graduation_year',
        'education_level',
        'wrong_data_description',
        'correct_data_description',
        'file_ijazah_wrong',
        'file_akte',
        'file_kk',
        'file_sptjm',
        'file_additional',
        'status',
        'current_step',
        'verifier_note',
        'submitted_by',
        'submitted_at',
        'approved_at',
        'pickup_notified_at',
    ];

    protected $casts = [
        'submitted_at'       => 'datetime',
        'approved_at'        => 'datetime',
        'pickup_notified_at' => 'datetime',
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
     * Generate a unique ticket number: IJZ-YYYYMMDD-NNN
     */
    public static function generateTicketNumber(): string
    {
        $prefix = 'IJZ-' . now()->format('Ymd');
        $lastTicket = static::where('ticket_number', 'like', $prefix . '%')
            ->orderBy('ticket_number', 'desc')
            ->first();

        $sequence = $lastTicket
            ? (int) substr($lastTicket->ticket_number, -3) + 1
            : 1;

        return $prefix . '-' . str_pad($sequence, 3, '0', STR_PAD_LEFT);
    }

    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }
}
