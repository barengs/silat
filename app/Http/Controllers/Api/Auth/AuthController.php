<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;

class AuthController extends Controller
{
    /**
     * Login — authenticate user and return JWT token.
     * POST /api/auth/login
     */
    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        $username = $request->input('username');
        $password = $request->input('password');

        // Tentukan apakah input berupa email atau NIP
        $field = filter_var($username, FILTER_VALIDATE_EMAIL) ? 'email' : 'nip';

        $user = User::query()->where($field, $username)->first();

        if (!$user || !Hash::check($password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Email atau password salah.',
                'error'   => 'invalid_credentials',
            ], 401);
        }

        if (!$user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Akun Anda telah dinonaktifkan. Hubungi administrator.',
            ], 403);
        }

        try {
            $token = JWTAuth::fromUser($user);
        } catch (JWTException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat token. Silakan coba lagi.',
            ], 500);
        }

        // Update last login timestamp
        $user->update(['last_login_at' => now()]);

        return response()->json([
            'success'     => true,
            'message'     => 'Login berhasil.',
            'token'       => $token,
            'token_type'  => 'bearer',
            'expires_in'  => config('jwt.ttl') * 60, // seconds
            'user'        => $this->userResource($user),
            'roles'       => $user->getRoleNames(),
            'permissions' => $user->getAllPermissions()->pluck('name'),
        ]);
    }

    /**
     * Logout — invalidate JWT token.
     * POST /api/auth/logout
     */
    public function logout()
    {
        try {
            JWTAuth::invalidate(JWTAuth::getToken());
        } catch (JWTException $e) {
            // Token already invalid, continue
        }

        return response()->json([
            'success' => true,
            'message' => 'Logout berhasil.',
        ]);
    }

    /**
     * Refresh — generate new JWT token.
     * POST /api/auth/refresh
     */
    public function refresh()
    {
        try {
            $newToken = JWTAuth::refresh(JWTAuth::getToken());
        } catch (JWTException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui token. Silakan login ulang.',
            ], 401);
        }

        return response()->json([
            'success'    => true,
            'token'      => $newToken,
            'token_type' => 'bearer',
            'expires_in' => config('jwt.ttl') * 60,
        ]);
    }

    /**
     * Me — return authenticated user profile with roles/permissions.
     * GET /api/auth/me
     */
    public function me()
    {
        $user = JWTAuth::parseToken()->authenticate();

        return response()->json([
            'success'     => true,
            'user'        => $this->userResource($user),
            'roles'       => $user->getRoleNames(),
            'permissions' => $user->getAllPermissions()->pluck('name'),
        ]);
    }

    /**
     * Forgot password — send reset email.
     * POST /api/auth/forgot-password
     */
    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email|exists:users,email']);

        // TODO: Implement password reset email using Laravel's built-in broker
        return response()->json([
            'success' => true,
            'message' => 'Email reset password telah dikirim.',
        ]);
    }

    /**
     * Reset password with token.
     * POST /api/auth/reset-password
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'token'                 => 'required',
            'email'                 => 'required|email',
            'password'              => 'required|min:8|confirmed',
        ]);

        // TODO: Implement password reset logic
        return response()->json([
            'success' => true,
            'message' => 'Password berhasil diubah.',
        ]);
    }

    /**
     * Transform user to API resource format.
     */
    private function userResource(User $user): array
    {
        $user->loadMissing(['institution', 'division']);
        return [
            'id'              => $user->id,
            'name'            => $user->name,
            'email'           => $user->email,
            'nip'             => $user->nip,
            'phone'           => $user->phone,
            'photo_path'      => $user->photo_path ? asset('storage/' . $user->photo_path) : null,
            'signature_path'  => $user->signature_image_path ? asset('storage/' . $user->signature_image_path) : null,
            'institution'     => $user->institution ? [
                'id'   => $user->institution->id,
                'name' => $user->institution->name,
                'type' => $user->institution->type,
            ] : null,
            'division'        => $user->division ? [
                'id'   => $user->division->id,
                'name' => $user->division->name,
            ] : null,
            'is_active'       => $user->is_active,
            'last_login_at'   => $user->last_login_at?->toISOString(),
        ];
    }
}
