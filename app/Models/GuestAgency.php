<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GuestAgency extends Model
{
    protected $fillable = ['name', 'type', 'city', 'visit_count'];

    public function guestBooks(): HasMany
    {
        return $this->hasMany(GuestBook::class);
    }

    /**
     * Increment visit count when a new guest from this agency checks in.
     */
    public function incrementVisit(): void
    {
        $this->increment('visit_count');
    }
}
