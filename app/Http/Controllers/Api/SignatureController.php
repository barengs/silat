<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SignatureController extends Controller
{
    /**
     * List all officials who can be signers (users with signing roles).
     * Returns their name, NIP, role, and whether they have a signature uploaded.
     */
    public function index(): JsonResponse
    {
        $signerRoles = ['kadis', 'sekretaris', 'kabid', 'super-admin'];

        $signers = User::where('is_active', '=', true)
            ->whereHas('roles', function ($q) use ($signerRoles) {
                $q->whereIn('name', $signerRoles);
            })
            ->with('roles:id,name')
            ->select('id', 'name', 'nip', 'email', 'signature_image_path', 'photo_path')
            ->orderBy('name')
            ->get()
            ->map(function ($user) {
                return [
                    'id'                   => $user->id,
                    'name'                 => $user->name,
                    'nip'                  => $user->nip,
                    'email'                => $user->email,
                    'role'                 => $user->roles->pluck('name')->first(),
                    'role_label'           => $this->getRoleLabel($user->roles->pluck('name')->first()),
                    'has_signature'        => ! empty($user->signature_image_path),
                    'signature_url'        => $user->signature_image_path
                        ? asset('storage/' . $user->signature_image_path)
                        : null,
                    'photo_url'            => $user->photo_path
                        ? asset('storage/' . $user->photo_path)
                        : null,
                ];
            });

        return response()->json(['data' => $signers]);
    }

    /**
     * Upload a signature image for a specific user.
     * Accepts PNG with transparent background, max 1MB.
     */
    public function upload(Request $request, int $userId): JsonResponse
    {
        $request->validate([
            'signature' => 'required|image|mimes:png|max:1024', // max 1MB
        ], [
            'signature.required' => 'File tanda tangan wajib diunggah.',
            'signature.image'    => 'File harus berupa gambar.',
            'signature.mimes'    => 'Format file harus PNG (background transparan).',
            'signature.max'      => 'Ukuran file maksimal 1MB.',
        ]);

        $user = User::findOrFail($userId);

        // Delete old signature if exists
        if ($user->signature_image_path) {
            Storage::disk('public')->delete($user->signature_image_path);
        }

        // Store new signature
        $path = $request->file('signature')->store('signatures', 'public');

        $user->signature_image_path = $path;
        $user->save();

        return response()->json([
            'message'       => 'Tanda tangan berhasil diunggah.',
            'signature_url' => asset('storage/' . $path),
        ]);
    }

    /**
     * Delete a user's signature image.
     */
    public function delete(int $userId): JsonResponse
    {
        $user = User::findOrFail($userId);

        if ($user->signature_image_path) {
            Storage::disk('public')->delete($user->signature_image_path);
            $user->signature_image_path = null;
            $user->save();
        }

        return response()->json([
            'message' => 'Tanda tangan berhasil dihapus.',
        ]);
    }

    /**
     * Get the current active signer for PDF generation.
     * Returns the user with 'kadis' role who has an uploaded signature.
     */
    public function getActiveSigner(): JsonResponse
    {
        $signer = User::where('is_active', '=', true)
            ->whereNotNull('signature_image_path')
            ->whereHas('roles', function ($q) {
                $q->where('name', 'kadis');
            })
            ->select('id', 'name', 'nip', 'signature_image_path')
            ->first();

        if (! $signer) {
            return response()->json([
                'message' => 'Tidak ada pejabat penanda tangan aktif dengan tanda tangan terunggah.',
                'data'    => null,
            ], 404);
        }

        return response()->json([
            'data' => [
                'id'            => $signer->id,
                'name'          => $signer->name,
                'nip'           => $signer->nip,
                'signature_url' => asset('storage/' . $signer->signature_image_path),
            ],
        ]);
    }

    /**
     * Map role name to a human-readable Indonesian label.
     */
    private function getRoleLabel(?string $roleName): string
    {
        return match ($roleName) {
            'kadis'       => 'Kepala Dinas',
            'sekretaris'  => 'Sekretaris Dinas',
            'kabid'       => 'Kepala Bidang',
            'super-admin' => 'Super Administrator',
            default       => ucfirst($roleName ?? 'Tidak Diketahui'),
        };
    }
}
