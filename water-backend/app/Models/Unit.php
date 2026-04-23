<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Unit extends Model
{
    protected $fillable = [
        'tenant_id',
        'month',
        'units'
    ];

    public $timestamps = false; // Assuming no timestamps in Java entity

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }
}
