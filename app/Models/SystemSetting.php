<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SystemSetting extends Model
{
    protected $fillable = [
        'setting_key',
        'setting_value',
        'type',
        'label',
        'group',
        'description',
    ];

    /**
     * Get a setting value by key with optional default.
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        $setting = static::where('setting_key', $key)->first();
        if (! $setting) {
            return $default;
        }

        return match ($setting->type) {
            'boolean' => (bool) $setting->setting_value,
            'integer' => (int) $setting->setting_value,
            'json' => json_decode($setting->setting_value, true),
            default => $setting->setting_value,
        };
    }

    /**
     * Set a setting value by key.
     */
    public static function set(string $key, mixed $value): static
    {
        $setting = static::firstOrNew(['setting_key' => $key]);
        $setting->setting_value = is_array($value) ? json_encode($value) : (string) $value;
        $setting->save();

        return $setting;
    }

    /**
     * Get all settings as a key-value associative array.
     */
    public static function getAllAsArray(): array
    {
        return static::all()->pluck('setting_value', 'setting_key')->toArray();
    }
}
