<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

class ProfileController extends Controller
{
    /**
     * Show current user profile.
     */
    public function show(Request $request)
    {
        $user = $request->user()->load(['institution', 'division']);
        
        return response()->json([
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'nip' => $user->nip,
                'phone' => $user->phone,
                'photo_path' => $user->photo_path ? asset('storage/' . $user->photo_path) : null,
                'signature_image_path' => $user->signature_image_path ? asset('storage/' . $user->signature_image_path) : null,
                'is_active' => $user->is_active,
                'roles' => $user->roles->pluck('name'),
                'permissions' => $user->getAllPermissions()->pluck('name'),
                'institution' => $user->institution ? [
                    'id' => $user->institution->id,
                    'name' => $user->institution->name,
                    'type' => $user->institution->type,
                ] : null,
                'division' => $user->division ? [
                    'id' => $user->division->id,
                    'name' => $user->division->name,
                ] : null,
            ]
        ]);
    }

    /**
     * Update user profile information.
     */
    public function update(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:20',
            'nip' => 'nullable|string|max:50|unique:users,nip,' . $user->id,
        ], [
            'email.unique' => 'Email sudah terdaftar oleh pengguna lain.',
            'nip.unique' => 'NIP sudah terdaftar oleh pengguna lain.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validasi gagal.',
                'errors' => $validator->errors()
            ], 422);
        }

        $user->update([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'nip' => $request->nip,
        ]);

        return response()->json([
            'message' => 'Profil berhasil diperbarui.',
            'data' => $user
        ]);
    }

    /**
     * Upload profile photo.
     */
    public function uploadPhoto(Request $request)
    {
        $request->validate([
            'photo' => 'required|image|mimes:jpeg,png,jpg|max:2048',
        ], [
            'photo.required' => 'File foto wajib diunggah.',
            'photo.image' => 'File harus berupa gambar.',
            'photo.mimes' => 'Format gambar harus jpeg, png, atau jpg.',
            'photo.max' => 'Ukuran gambar maksimal adalah 2MB.',
        ]);

        $user = $request->user();

        if ($user->photo_path) {
            Storage::disk('public')->delete($user->photo_path);
        }

        $path = $request->file('photo')->store('photos', 'public');
        $user->photo_path = $path;
        $user->save();

        return response()->json([
            'message' => 'Foto profil berhasil diperbarui.',
            'photo_url' => asset('storage/' . $path)
        ]);
    }

    /**
     * Upload digital signature (TTE).
     */
    public function uploadSignature(Request $request)
    {
        $request->validate([
            'signature' => 'required|image|mimes:png|max:1024',
        ], [
            'signature.required' => 'File tanda tangan wajib diunggah.',
            'signature.image' => 'File harus berupa gambar.',
            'signature.mimes' => 'Tanda tangan harus dalam format PNG transparan.',
            'signature.max' => 'Ukuran tanda tangan maksimal adalah 1MB.',
        ]);

        $user = $request->user();

        if ($user->signature_image_path) {
            Storage::disk('public')->delete($user->signature_image_path);
        }

        $path = $request->file('signature')->store('signatures', 'public');
        $user->signature_image_path = $path;
        $user->save();

        return response()->json([
            'message' => 'Tanda tangan elektronik berhasil diperbarui.',
            'signature_url' => asset('storage/' . $path)
        ]);
    }

    /**
     * Change user password.
     */
    public function changePassword(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'new_password' => ['required', 'confirmed', Password::min(8)],
        ], [
            'current_password.required' => 'Password saat ini wajib diisi.',
            'new_password.required' => 'Password baru wajib diisi.',
            'new_password.confirmed' => 'Konfirmasi password baru tidak cocok.',
            'new_password.min' => 'Password baru minimal harus 8 karakter.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validasi gagal.',
                'errors' => $validator->errors()
            ], 422);
        }

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'message' => 'Password saat ini salah.',
                'errors' => [
                    'current_password' => ['Password saat ini salah.']
                ]
            ], 422);
        }

        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json([
            'message' => 'Password berhasil diperbarui.'
        ]);
    }
}
