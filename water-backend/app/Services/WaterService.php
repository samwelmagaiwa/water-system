<?php

namespace App\Services;

use App\Models\Bill;
use App\Models\Tenant;
use App\Models\Unit;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class WaterService
{
    private const UNIT_PRICE = 1700;

    public function getAllTenants()
    {
        // Eloquent hides 'units' and 'payments' inherently unless loaded. We return raw tenants.
        return Tenant::all();
    }

    public function addUnits($tenantId, $month, $units)
    {
        if ($units < 0) {
            throw new \InvalidArgumentException("Units cannot be negative");
        }

        $tenant = Tenant::findOrFail($tenantId);

        $unit = Unit::firstOrNew([
            'tenant_id' => $tenantId,
            'month'     => $month
        ]);

        $unit->units = $units;
        $unit->save();

        return $unit;
    }

    public function getDashboardData($month)
    {
        $monthBill = Bill::where('month', $month)->first();
        $totalBill = $monthBill ? $monthBill->total_bill : 0;

        $summary = $this->getTenantSummary($month);
        $totalTenantCost = collect($summary)->sum('cost');

        $margin = $totalTenantCost - $totalBill;

        $totalCollected = Payment::where('month', $month)->sum('amount');

        $outstanding = $totalTenantCost - $totalCollected;

        $paidPercentage = 0;
        if ($totalTenantCost > 0) {
            $paidPercentage = round(($totalCollected * 100) / $totalTenantCost, 2);
        }

        return [
            'month'           => $month,
            'totalBill'       => $totalBill,
            'totalTenantCost' => $totalTenantCost,
            'margin'          => $margin,
            'collected'       => $totalCollected,
            'outstanding'     => $outstanding,
            'paidPercentage'  => $paidPercentage
        ];
    }

    public function setBill($month, $totalBill, $totalUnits)
    {
        if ($totalBill < 0) {
            throw new \InvalidArgumentException("Bill amount cannot be negative");
        }

        $bill = Bill::firstOrNew(['month' => $month]);
        $bill->total_bill = $totalBill;
        $bill->total_units = $totalUnits;
        $bill->save();

        return $bill;
    }

    public function getPaymentsByMonth($month)
    {
        return Payment::with('tenant')->where('month', $month)->get();
    }

    public function addPayment($tenantId, $month, $amount)
    {
        if ($amount < 0) {
            throw new \InvalidArgumentException("Payment amount cannot be negative");
        }

        $tenant = Tenant::findOrFail($tenantId);

        // Delete existing payments for that month correctly
        Payment::where('tenant_id', $tenantId)->where('month', $month)->delete();

        $payment = new Payment([
            'tenant_id' => $tenantId,
            'month'     => $month,
            'amount'    => $amount,
            'payment_date' => Carbon::now()->toDateString()
        ]);
        
        $payment->save();

        return $payment;
    }

    public function getTenantSummary($month)
    {
        $tenants = Tenant::all();
        $currentUnitsList = Unit::where('month', $month)->get()->keyBy('tenant_id');
        $paymentsList = Payment::where('month', $month)->get()->groupBy('tenant_id');
        
        $finalPrice = self::UNIT_PRICE;
        
        $summary = [];
        
        foreach ($tenants as $tenant) {
            $prevUnits = $tenant->previous_units ?? 0;
            
            $currentUnitObj = $currentUnitsList->get($tenant->id);
            $currentReading = $currentUnitObj ? $currentUnitObj->units : $prevUnits;
            
            $unitsConsumed = max(0, $currentReading - $prevUnits);
            $cost = $finalPrice * $unitsConsumed;
            
            $tenantPayments = $paymentsList->get($tenant->id);
            $totalPaid = $tenantPayments ? $tenantPayments->sum('amount') : 0;
            
            $status = ($totalPaid >= $cost && $cost > 0) ? "PAID" : "PENDING";
            
            $summary[] = [
                'tenantId'      => $tenant->id,
                'name'          => $tenant->name,
                'phone'         => $tenant->phone,
                'doorNumber'    => $tenant->door_number,
                'previousUnits' => $prevUnits,
                'units'         => $currentReading,
                'billUnit'      => $unitsConsumed,
                'cost'          => $cost,
                'paid'          => $totalPaid,
                'due'           => $cost - $totalPaid,
                'status'        => $status
            ];
        }
        
        return $summary;
    }

    public function createTenant($name, $phone, $role, $previousUnits, $doorNumber)
    {
        if (Tenant::where('phone', $phone)->exists()) {
            throw new \RuntimeException("Tenant with this phone already exists");
        }

        $tenant = new Tenant();
        $tenant->name = $name;
        $tenant->phone = $phone;
        $tenant->role = $role ?? Tenant::ROLE_TENANT;
        $tenant->previous_units = $previousUnits ?? 0;
        $tenant->door_number = $doorNumber;
        $tenant->save();

        return $tenant;
    }

    public function updateTenant($id, $name, $phone, $role, $previousUnits, $doorNumber)
    {
        $tenant = Tenant::findOrFail($id);
        $tenant->name = $name;
        $tenant->phone = $phone;
        $tenant->role = $role ?? Tenant::ROLE_TENANT;
        $tenant->previous_units = $previousUnits ?? 0;
        $tenant->door_number = $doorNumber;
        $tenant->save();

        return $tenant;
    }

    public function deleteTenant($id)
    {
        $tenant = Tenant::findOrFail($id);
        // Cascades should handle this if foreign constraints exist, 
        // but we can manually delete to be safe or mirroring Java:
        $tenant->units()->delete();
        $tenant->payments()->delete();
        $tenant->delete();
    }

    public function updateTenantBaseline($id, $previousUnits)
    {
        $tenant = Tenant::findOrFail($id);
        $tenant->previous_units = $previousUnits ?? 0;
        $tenant->save();

        return $tenant;
    }

    public function registerTenant($name, $phone)
    {
        $role = $this->determineRole($phone);
        return $this->createTenant($name, $phone, $role, 0, null);
    }

    public function loginByPhone($phone)
    {
        $tenant = Tenant::where('phone', $phone)->first();
        if (!$tenant) {
            throw new \RuntimeException("User not found with phone: " . $phone);
        }
        return $tenant;
    }

    public function getTenantById($id)
    {
        return Tenant::findOrFail($id);
    }

    public function isAdmin($phone)
    {
        return $this->determineRole($phone) === Tenant::ROLE_ADMIN;
    }

    private function determineRole($phone)
    {
        $adminPhones = ["2557000000", "0617919104", "0700000001"];
        
        if ($phone) {
            foreach ($adminPhones as $adminPhone) {
                if (str_contains($phone, $adminPhone)) {
                    return Tenant::ROLE_ADMIN;
                }
            }
        }
        return Tenant::ROLE_TENANT;
    }

    public function getTenantUsage($month)
    {
        return $this->getTenantSummary($month);
    }
}
