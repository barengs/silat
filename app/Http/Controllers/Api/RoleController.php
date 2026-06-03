<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\DB;

class RoleController extends Controller
{
    /**
     * Display a listing of all roles with their permissions.
     */
    public function index()
    {
        // Don't show super-admin in the normal management list to prevent accidental changes
        $roles = Role::with('permissions')
            ->where('name', '!=', 'super-admin')
            ->orderBy('id')
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $roles,
        ]);
    }

    /**
     * Store a newly created role.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name'        => 'required|string|unique:roles,name',
            'permissions' => 'nullable|array',
            'permissions.*' => 'string|exists:permissions,name',
        ]);

        DB::beginTransaction();
        try {
            // Guard name should be 'api' since our whole app uses API tokens
            $role = Role::create([
                'name'       => $request->name,
                'guard_name' => 'api'
            ]);

            if ($request->has('permissions')) {
                $role->syncPermissions($request->permissions);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Role berhasil dibuat.',
                'data'    => $role->load('permissions'),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat role: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified role.
     */
    public function show(Role $role)
    {
        if ($role->name === 'super-admin') {
            return response()->json(['success' => false, 'message' => 'Akses ditolak.'], 403);
        }

        return response()->json([
            'success' => true,
            'data'    => $role->load('permissions'),
        ]);
    }

    /**
     * Update the specified role and sync permissions.
     */
    public function update(Request $request, Role $role)
    {
        if ($role->name === 'super-admin') {
            return response()->json(['success' => false, 'message' => 'Tidak dapat mengubah super-admin.'], 403);
        }

        $request->validate([
            'name'        => 'required|string|unique:roles,name,' . $role->id,
            'permissions' => 'nullable|array',
            'permissions.*' => 'string|exists:permissions,name',
        ]);

        DB::beginTransaction();
        try {
            $role->update(['name' => $request->name]);

            if ($request->has('permissions')) {
                // syncPermissions will remove old permissions and add new ones
                $role->syncPermissions($request->permissions);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Role berhasil diperbarui.',
                'data'    => $role->load('permissions'),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui role: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified role.
     */
    public function destroy(Role $role)
    {
        if (in_array($role->name, ['super-admin', 'admin-dinas', 'verifikator'])) {
            return response()->json([
                'success' => false,
                'message' => 'Role sistem (core roles) tidak dapat dihapus.',
            ], 403);
        }

        try {
            $role->delete();
            return response()->json([
                'success' => true,
                'message' => 'Role berhasil dihapus.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus role: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get all permissions grouped by module for Matrix UI.
     * Example output:
     * { "sppd": ["view-own", "create", "approve"], "users": ["view", "create"] }
     */
    public function permissionsMatrix()
    {
        $permissions = Permission::all();
        $matrix = [];

        foreach ($permissions as $permission) {
            // Split by the first dot (e.g., 'sppd.view-all' -> module: 'sppd', action: 'view-all')
            $parts = explode('.', $permission->name, 2);
            
            if (count($parts) === 2) {
                $module = $parts[0];
                $action = $parts[1];
                
                if (!isset($matrix[$module])) {
                    $matrix[$module] = [];
                }
                
                $matrix[$module][] = [
                    'id'   => $permission->id,
                    'name' => $permission->name,
                    'action' => $action
                ];
            } else {
                // If it doesn't have a dot, put it in 'others'
                if (!isset($matrix['others'])) {
                    $matrix['others'] = [];
                }
                $matrix['others'][] = [
                    'id'   => $permission->id,
                    'name' => $permission->name,
                    'action' => $permission->name
                ];
            }
        }

        return response()->json([
            'success' => true,
            'data'    => $matrix,
        ]);
    }
}
