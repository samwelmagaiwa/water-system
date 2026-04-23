<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\WaterController;

Route::prefix('v1')->group(function () {
    Route::get('/tenants', [WaterController::class, 'getTenants']);
    Route::get('/tenants/{id}', [WaterController::class, 'getTenant']);
    Route::post('/tenants/create', [WaterController::class, 'createTenant']);
    Route::put('/tenants/{id}', [WaterController::class, 'updateTenant']);
    Route::delete('/tenants/{id}', [WaterController::class, 'deleteTenant']);
    Route::post('/tenants/{id}/baseline', [WaterController::class, 'updateBaseline']);

    Route::post('/units', [WaterController::class, 'addUnits']);
    Route::get('/dashboard', [WaterController::class, 'getDashboard']);
    Route::get('/usage', [WaterController::class, 'getUsage']);

    Route::post('/bill', [WaterController::class, 'setBill']);

    Route::get('/payments', [WaterController::class, 'getPayments']);
    Route::post('/payments', [WaterController::class, 'addPayment']);

    Route::get('/tenant-summary', [WaterController::class, 'getTenantSummary']);
    Route::post('/register', [WaterController::class, 'register']);
    Route::post('/login', [WaterController::class, 'login']);

    Route::get('/current-user', [WaterController::class, 'getCurrentUser']);
    Route::get('/tenant-units', [WaterController::class, 'getTenantUnits']);
    Route::post('/admin-check', [WaterController::class, 'checkAdmin']);
});

