<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Permission\Models\Role;

class ApprovalFlow extends Model
{
    protected $fillable = [
        'module_name',
        'step_order',
        'step_label',
        'role_id_required',
        'action_type',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class, 'role_id_required');
    }

    /**
     * Get all steps for a specific module, ordered.
     */
    public static function getFlowForModule(string $module): Collection
    {
        return static::query()
            ->where('module_name', $module)
            ->where('is_active', true)
            ->orderBy('step_order')
            ->get();
    }
}
