<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SppdReport extends Model
{
    protected $fillable = [
        'sppd_id',
        'real_start_date',
        'real_end_date',
        'report_text',
        'attachment_proof',
        'actual_cost',
        'notes',
        'submitted_by',
        'submitted_at',
    ];

    protected $casts = [
        'real_start_date' => 'date',
        'real_end_date' => 'date',
        'submitted_at' => 'datetime',
        'actual_cost' => 'decimal:2',
    ];

    public function sppd(): BelongsTo
    {
        return $this->belongsTo(Sppd::class);
    }

    public function submittedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }
}
