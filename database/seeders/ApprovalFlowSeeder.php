<?php

namespace Database\Seeders;

use App\Models\ApprovalFlow;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class ApprovalFlowSeeder extends Seeder
{
    public function run(): void
    {
        // Fetch roles
        $roleKepsek = Role::where('name', 'kepala-sekolah')->first();
        $roleVerifikator = Role::where('name', 'verifikator')->first();
        $roleKabid = Role::where('name', 'kabid')->first();
        $roleKadis = Role::where('name', 'kadis')->first();
        $roleApprover = Role::where('name', 'approver')->first();

        // ── 1. Module: Ijazah ───────────────────────────────────────────────
        $ijazahSteps = [
            [
                'step_order' => 1,
                'step_label' => 'Persetujuan Kepala Sekolah',
                'role_id_required' => $roleKepsek?->id,
                'action_type' => 'approve',
            ],
            [
                'step_order' => 2,
                'step_label' => 'Verifikasi Berkas Pendukung (KK, SPTJM, dll)',
                'role_id_required' => $roleVerifikator?->id,
                'action_type' => 'verify',
            ],
            [
                'step_order' => 3,
                'step_label' => 'Persetujuan / Disposisi Kabid',
                'role_id_required' => $roleKabid?->id ?? $roleApprover?->id,
                'action_type' => 'approve',
            ],
            [
                'step_order' => 4,
                'step_label' => 'Pemrosesan Dokumen oleh Staf',
                'role_id_required' => $roleVerifikator?->id,
                'action_type' => 'verify',
            ],
            [
                'step_order' => 5,
                'step_label' => 'Pengesahan Kepala Dinas',
                'role_id_required' => $roleKadis?->id ?? $roleApprover?->id,
                'action_type' => 'approve',
            ],
        ];

        foreach ($ijazahSteps as $step) {
            if ($step['role_id_required']) {
                ApprovalFlow::updateOrCreate(
                    ['module_name' => 'ijazah', 'step_order' => $step['step_order']],
                    array_merge($step, ['is_active' => true])
                );
            }
        }

        // ── 2. Module: SPPD ─────────────────────────────────────────────────
        $sppdSteps = [
            [
                'step_order' => 1,
                'step_label' => 'Persetujuan Kepala Sekolah',
                'role_id_required' => $roleKepsek?->id,
                'action_type' => 'approve',
            ],
            [
                'step_order' => 2,
                'step_label' => 'Verifikasi Admin Disdik / Kabid',
                'role_id_required' => $roleKabid?->id,
                'action_type' => 'approve',
            ],
        ];

        // Soft-delete or remove old steps if necessary
        ApprovalFlow::where('module_name', 'sppd')->delete();

        foreach ($sppdSteps as $step) {
            if ($step['role_id_required']) {
                ApprovalFlow::create(
                    array_merge($step, ['module_name' => 'sppd', 'is_active' => true])
                );
            }
        }

        // ── 3. Module: Bendahara ────────────────────────────────────────────
        $bendaharaSteps = [
            [
                'step_order' => 1,
                'step_label' => 'Persetujuan Kepala Sekolah',
                'role_id_required' => $roleKepsek?->id,
                'action_type' => 'approve',
            ],
            [
                'step_order' => 2,
                'step_label' => 'Verifikasi Berkas Bendahara',
                'role_id_required' => $roleVerifikator?->id,
                'action_type' => 'verify',
            ],
            [
                'step_order' => 3,
                'step_label' => 'Persetujuan Kabid',
                'role_id_required' => $roleKabid?->id ?? $roleApprover?->id,
                'action_type' => 'approve',
            ],
            [
                'step_order' => 4,
                'step_label' => 'Pengesahan Kepala Dinas',
                'role_id_required' => $roleKadis?->id ?? $roleApprover?->id,
                'action_type' => 'approve',
            ],
        ];

        foreach ($bendaharaSteps as $step) {
            if ($step['role_id_required']) {
                ApprovalFlow::updateOrCreate(
                    ['module_name' => 'bendahara', 'step_order' => $step['step_order']],
                    array_merge($step, ['is_active' => true])
                );
            }
        }

        // ── 4. Module: School Transfer ──────────────────────────────────────
        $transferSteps = [
            [
                'step_order' => 1,
                'step_label' => 'Persetujuan Kepala Sekolah',
                'role_id_required' => $roleKepsek?->id,
                'action_type' => 'approve',
            ],
            [
                'step_order' => 2,
                'step_label' => 'Verifikasi Berkas Cabdin',
                'role_id_required' => $roleVerifikator?->id,
                'action_type' => 'verify',
            ],
            [
                'step_order' => 3,
                'step_label' => 'Pengesahan Kepala Dinas',
                'role_id_required' => $roleKadis?->id ?? $roleApprover?->id,
                'action_type' => 'approve',
            ],
        ];

        foreach ($transferSteps as $step) {
            if ($step['role_id_required']) {
                ApprovalFlow::updateOrCreate(
                    ['module_name' => 'school_transfer', 'step_order' => $step['step_order']],
                    array_merge($step, ['is_active' => true])
                );
            }
        }
    }
}
