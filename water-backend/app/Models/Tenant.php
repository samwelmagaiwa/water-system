<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tenant extends Model
{
    protected $fillable = [
        'name',
        'phone',
        'role',
        'previousUnits',
        'doorNumber'
    ];

    public $timestamps = false;

    // Role constants
    public const ROLE_ADMIN = 'ADMIN';
    public const ROLE_TENANT = 'TENANT';

    public function toArray()
    {
        $array = parent::toArray();
        $array['doorNumber'] = $array['door_number'] ?? null;
        $array['previousUnits'] = $array['previous_units'] ?? 0;
        unset($array['door_number'], $array['previous_units']);
        return $array;
    }

    public function units(): HasMany
    {
        return $this->hasMany(Unit::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }
}
