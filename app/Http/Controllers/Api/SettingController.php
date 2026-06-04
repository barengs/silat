<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\SystemSetting;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class SettingController extends Controller
{
    /**
     * Display a listing of the settings.
     */
    public function index(Request $request)
    {
        $settings = SystemSetting::all();
        
        // Group settings by group field
        $groupedSettings = $settings->groupBy('group');

        return response()->json([
            'data' => $settings,
            'grouped' => $groupedSettings
        ]);
    }

    /**
     * Update settings in bulk.
     */
    public function update(Request $request)
    {
        $rules = [];
        $settingsData = $request->input('settings', []);

        foreach ($settingsData as $key => $value) {
            // Kita bisa menambahkan validasi sederhana jika diperlukan
            $rules[$key] = 'nullable';
        }

        $validator = Validator::make($settingsData, $rules);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validasi gagal.',
                'errors' => $validator->errors()
            ], 422);
        }

        foreach ($settingsData as $key => $value) {
            SystemSetting::set($key, $value);
        }

        return response()->json([
            'message' => 'Pengaturan berhasil disimpan.',
            'data' => SystemSetting::getAllAsArray()
        ]);
    }

    /**
     * Upload app/dinas logos.
     */
    public function uploadLogo(Request $request)
    {
        $request->validate([
            'key' => 'required|string|in:app_logo,app_favicon,dinas_logo,kabupaten_logo',
            'image' => 'required|image|mimes:jpeg,png,jpg,ico|max:1024',
        ], [
            'key.required' => 'Key pengaturan wajib disertakan.',
            'key.in' => 'Key logo tidak valid.',
            'image.required' => 'File gambar logo wajib diunggah.',
            'image.image' => 'File harus berupa gambar.',
            'image.mimes' => 'Format file harus berupa jpeg, png, jpg, atau ico.',
            'image.max' => 'Ukuran file maksimal adalah 1MB.',
        ]);

        $key = $request->input('key');
        $setting = SystemSetting::where('setting_key', $key)->firstOrFail();

        if ($setting->setting_value) {
            Storage::disk('public')->delete($setting->setting_value);
        }

        $path = $request->file('image')->store('settings', 'public');
        
        $setting->setting_value = $path;
        $setting->save();

        return response()->json([
            'message' => 'Logo berhasil diperbarui.',
            'path' => $path,
            'url' => asset('storage/' . $path)
        ]);
    }
}
