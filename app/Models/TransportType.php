<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TransportType extends Model
{
    protected $fillable = ['name', 'icon', 'description', 'is_active'];

    protected $casts = ['is_active' => 'boolean'];

    public function sppds()
    {
        return $this->hasMany(Sppd::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
