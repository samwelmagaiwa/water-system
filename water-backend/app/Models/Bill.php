<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Bill extends Model
{
    protected $fillable = [
        'month',
        'totalBill',
        'totalUnits'
    ];

    public $timestamps = false;

    public function toArray()
    {
        $array = parent::toArray();
        $array['totalBill'] = $array['total_bill'] ?? null;
        $array['totalUnits'] = $array['total_units'] ?? 0;
        unset($array['total_bill'], $array['total_units']);
        return $array;
    }
}
