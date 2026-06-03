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

    public function approvalFlow(): BelongsTo
    {
        return $this->belongsTo(ApprovalFlow::class);
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
