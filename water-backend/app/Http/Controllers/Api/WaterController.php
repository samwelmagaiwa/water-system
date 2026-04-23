<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\WaterService;
use App\Models\Unit;
use Illuminate\Http\Request;

class WaterController extends Controller
{
    protected $waterService;

    public function __construct(WaterService $waterService)
    {
        $this->waterService = $waterService;
    }

    public function getTenants()
    {
        return response()->json($this->waterService->getAllTenants());
    }

    public function addUnits(Request $request)
    {
        $tenantId = $request->input('tenantId');
        $month = $request->input('month');
        $units = $request->input('units');

        $unit = $this->waterService->addUnits($tenantId, $month, $units);
        return response()->json($unit);
    }

    public function getDashboard(Request $request)
    {
        $month = $request->query('month');
        return response()->json($this->waterService->getDashboardData($month));
    }

    public function getUsage(Request $request)
    {
        $month = $request->query('month');
        return response()->json($this->waterService->getTenantUsage($month));
    }

    public function setBill(Request $request)
    {
        $month = $request->input('month');
        $totalBill = $request->input('totalBill');
        $totalUnits = $request->input('totalUnits');
        
        $this->waterService->setBill($month, $totalBill, $totalUnits);
        
        return response()->json(['message' => 'Bill set successfully']);
    }

    public function getPayments(Request $request)
    {
        $month = $request->query('month');
        return response()->json($this->waterService->getPaymentsByMonth($month));
    }

    public function addPayment(Request $request)
    {
        $tenantId = $request->input('tenantId');
        $month = $request->input('month', 'Current');
        $amount = $request->input('amount');
        
        $payment = $this->waterService->addPayment($tenantId, $month, $amount);
        return response()->json($payment);
    }

    public function getTenantSummary(Request $request)
    {
        $month = $request->query('month');
        return response()->json($this->waterService->getTenantSummary($month));
    }

    public function register(Request $request)
    {
        $name = $request->input('name');
        $phone = $request->input('phone');
        
        $tenant = $this->waterService->registerTenant($name, $phone);
        return response()->json($tenant);
    }

    public function login(Request $request)
    {
        $phone = $request->input('phone');
        $tenant = $this->waterService->loginByPhone($phone);
        return response()->json($tenant);
    }

    public function getCurrentUser(Request $request)
    {
        $tenantId = $request->query('tenantId');
        return response()->json($this->waterService->getTenantById($tenantId));
    }

    public function getTenantUnits(Request $request)
    {
        $tenantId = $request->query('tenantId');
        $month = $request->query('month');
        
        $unit = Unit::where('tenant_id', $tenantId)->where('month', $month)->first();
        if (!$unit) {
            // Spring Boot returned empty Unit
            return response()->json(new \stdClass());
        }
        return response()->json($unit);
    }

    public function checkAdmin(Request $request)
    {
        $phone = $request->input('phone');
        $isAdmin = $this->waterService->isAdmin($phone);
        return response()->json(['isAdmin' => $isAdmin]);
    }

    public function getTenant($id)
    {
        return response()->json($this->waterService->getTenantById($id));
    }

    public function createTenant(Request $request)
    {
        $name = $request->input('name');
        $phone = $request->input('phone');
        $roleStr = $request->input('role', 'TENANT');
        $prevUnits = $request->input('previousUnits', 0);
        $doorNumber = $request->input('doorNumber');

        $role = strtoupper($roleStr) === 'ADMIN' ? 'ADMIN' : 'TENANT';
        
        $tenant = $this->waterService->createTenant($name, $phone, $role, $prevUnits, $doorNumber);
        return response()->json($tenant);
    }

    public function updateTenant(Request $request, $id)
    {
        $name = $request->input('name');
        $phone = $request->input('phone');
        $roleStr = $request->input('role', 'TENANT');
        $prevUnits = $request->input('previousUnits', 0);
        $doorNumber = $request->input('doorNumber');

        $role = strtoupper($roleStr) === 'ADMIN' ? 'ADMIN' : 'TENANT';

        $tenant = $this->waterService->updateTenant($id, $name, $phone, $role, $prevUnits, $doorNumber);
        return response()->json($tenant);
    }

    public function deleteTenant($id)
    {
        try {
            $this->waterService->deleteTenant($id);
            return response()->json(['message' => 'Tenant deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Could not delete tenant: ' . $e->getMessage()], 500);
        }
    }

    public function updateBaseline(Request $request, $id)
    {
        try {
            $units = $request->input('previousUnits', 0);
            $tenant = $this->waterService->updateTenantBaseline($id, $units);
            return response()->json($tenant);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to update baseline: ' . $e->getMessage()], 500);
        }
    }
}
