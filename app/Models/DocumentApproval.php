<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class DocumentApproval extends Model
{
    protected $fillable = [
        'document_type',
        'document_id',
        'approval_flow_id',
        'step_order',
        'user_id',
        'status',
        'note',
        'qr_verification_token',
        'qr_verification_url',
        'acted_at',
    ];

    protected $appends = [
        'action_taken',
        'notes',
        'step_label',
    ];

    protected $casts = [
        'acted_at' => 'datetime',
    ];

    /**
     * The document this approval belongs to (polymorphic).
     */
    public function document(): MorphTo
    {
        return $this->morphTo();
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function approvalFlow(): BelongsTo
    {
        return $this->belongsTo(ApprovalFlow::class);
    }

    public function step(): BelongsTo
    {
        return $this->belongsTo(ApprovalFlow::class, 'approval_flow_id');
    }

    // Accessors for compatibility with code/frontend expecting different names
    public function getActionTakenAttribute()
    {
        return $this->status;
    }

    public function getNotesAttribute()
    {
        return $this->note;
    }

    public function getStepLabelAttribute()
    {
        return $this->approvalFlow?->step_label;
    }

    /**
     * Scope: only pending approvals.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope: find by QR verification token.
     */
    public function scopeByToken($query, string $token)
    {
        return $query->where('qr_verification_token', $token);
    }
}
