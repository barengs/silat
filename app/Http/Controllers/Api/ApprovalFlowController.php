<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ApprovalFlow;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;

class ApprovalFlowController extends Controller
{
    /**
     * Get all approval flows grouped by module, along with available roles.
     */
    public function index()
    {
        $flows = ApprovalFlow::with('role')
            ->orderBy('module_name')
            ->orderBy('step_order')
            ->get()
            ->groupBy('module_name');

        $roles = Role::all(['id', 'name']);

        return response()->json([
            'flows' => $flows,
            'roles' => $roles,
        ]);
    }

    /**
     * Update/recreate the approval flow steps for a module.
     */
    public function update(Request $request, $module)
    {
        if (!in_array($module, ['sppd', 'ijazah', 'bendahara', 'school_transfer'])) {
            return response()->json(['message' => 'Modul tidak valid.'], 400);
        }

        $request->validate([
            'steps' => 'required|array',
            'steps.*.step_label' => 'required|string|max:255',
            'steps.*.role_id_required' => 'required|exists:roles,id',
            'steps.*.action_type' => 'required|in:verify,approve,reject,forward',
            'steps.*.is_active' => 'boolean',
        ]);

        DB::beginTransaction();
        try {
            // Delete existing flows for this module
            ApprovalFlow::query()->where('module_name', $module)->delete();

            $stepsData = $request->input('steps');
            $created = [];

            foreach ($stepsData as $index => $step) {
                $created[] = ApprovalFlow::create([
                    'module_name' => $module,
                    'step_order' => $index + 1, // Enforce sequence order starting at 1
                    'step_label' => $step['step_label'],
                    'role_id_required' => $step['role_id_required'],
                    'action_type' => $step['action_type'],
                    'is_active' => $step['is_active'] ?? true,
                ]);
            }

            DB::commit();

            return response()->json([
                'message' => 'Alur persetujuan berhasil diperbarui.',
                'data' => $created,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Gagal memperbarui alur persetujuan.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
