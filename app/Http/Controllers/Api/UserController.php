<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\UsersExport;
use App\Imports\UsersImport;

class UserController extends Controller
{
    /**
     * Display a listing of the users.
     */
    public function index(Request $request)
    {
        $query = User::query()->with(['roles', 'institution', 'division']);

        // Filter by institution (Dinas vs Sekolah)
        if ($request->has('institution_id')) {
            $query->where('institution_id', $request->institution_id);
        }

        // Filter by division
        if ($request->has('division_id')) {
            $query->where('division_id', $request->division_id);
        }

        // Filter by active status
        if ($request->has('is_active')) {
            $query->where('is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN));
        }

        // Search by name, nip, or email
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('nip', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->orderBy('name')->paginate($request->per_page ?? 10);

        return response()->json([
            'success' => true,
            'data'    => $users,
        ]);
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name'           => 'required|string|max:255',
            'nip'            => 'required|string|unique:users,nip',
            'email'          => 'required|email|unique:users,email',
            'institution_id' => 'nullable|exists:institutions,id',
            'division_id'    => 'nullable|exists:divisions,id',
            'roles'          => 'required|array|min:1',
            'roles.*'        => 'string|exists:roles,name',
        ]);

        DB::beginTransaction();
        try {
            // As discussed, default password = NIP
            $password = Hash::make($request->nip);

            $user = User::create([
                'name'           => $request->name,
                'nip'            => $request->nip,
                'email'          => $request->email,
                'password'       => $password,
                'institution_id' => $request->institution_id,
                'division_id'    => $request->division_id,
                'is_active'      => true,
            ]);

            // Assign multiple roles
            $user->syncRoles($request->roles);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Pengguna berhasil ditambahkan. Password diset menggunakan NIP.',
                'data'    => $user->load(['roles', 'institution', 'division']),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal menambahkan pengguna: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified user.
     */
    public function show(User $user)
    {
        return response()->json([
            'success' => true,
            'data'    => $user->load(['roles', 'institution', 'division']),
        ]);
    }

    /**
     * Update the specified user in storage.
     */
    public function update(Request $request, User $user)
    {
        $request->validate([
            'name'           => 'required|string|max:255',
            'nip'            => ['required', 'string', Rule::unique('users')->ignore($user->id)],
            'email'          => ['required', 'email', Rule::unique('users')->ignore($user->id)],
            'institution_id' => 'nullable|exists:institutions,id',
            'division_id'    => 'nullable|exists:divisions,id',
            'roles'          => 'required|array|min:1',
            'roles.*'        => 'string|exists:roles,name',
            'is_active'      => 'boolean',
        ]);

        // Prevent modification of super admin unless the user has super-admin role
        // A complete auth check will be in the middleware/Gate, but doing basic protection here
        if ($user->hasRole('super-admin') && Auth::user() && !Auth::user()->hasRole('super-admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak untuk memodifikasi super-admin.',
            ], 403);
        }

        DB::beginTransaction();
        try {
            $user->update([
                'name'           => $request->name,
                'nip'            => $request->nip,
                'email'          => $request->email,
                'institution_id' => $request->institution_id,
                'division_id'    => $request->division_id,
                'is_active'      => $request->has('is_active') ? $request->is_active : $user->is_active,
            ]);

            // Prevent removing super-admin role from the main super-admin user
            if ($user->id === 1 && !in_array('super-admin', $request->roles)) {
                $roles = $request->roles;
                $roles[] = 'super-admin';
                $user->syncRoles($roles);
            } else {
                $user->syncRoles($request->roles);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Data pengguna berhasil diperbarui.',
                'data'    => $user->load(['roles', 'institution', 'division']),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui pengguna: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified user from storage (Soft Delete).
     */
    public function destroy(User $user)
    {
        if ($user->hasRole('super-admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak dapat menghapus super-admin.',
            ], 403);
        }

        if ($user->id === Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak dapat menghapus akun Anda sendiri.',
            ], 403);
        }

        try {
            User::destroy($user->id);
            return response()->json([
                'success' => true,
                'message' => 'Pengguna berhasil dihapus',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus pengguna, kemungkinan karena ada data terkait.',
            ], 500);
        }
    }

    /**
     * Export all users to Excel.
     */
    public function export()
    {
        return Excel::download(new UsersExport, 'daftar-pengguna.xlsx');
    }

    /**
     * Download Excel template for user import.
     */
    public function template()
    {
        // We will just generate an empty export with headers
        return Excel::download(new UsersExport, 'template-import-pengguna.xlsx');
    }

    /**
     * Import users from Excel.
     */
    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv|max:10240', // max 10MB
        ]);

        try {
            Excel::import(new UsersImport, $request->file('file'));
            return response()->json([
                'success' => true,
                'message' => 'Data pengguna berhasil diimpor.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengimpor data: ' . $e->getMessage(),
            ], 500);
        }
    }
}
