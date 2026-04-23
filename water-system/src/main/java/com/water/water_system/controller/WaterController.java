package com.water.water_system.controller;

import com.water.water_system.entity.Tenant;
import com.water.water_system.entity.Unit;
import com.water.water_system.entity.Payment;
import com.water.water_system.service.WaterService;
import com.water.water_system.repository.UnitRepository;
import com.water.water_system.dto.BillRequestDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class WaterController {

    @Autowired
    private WaterService waterService;

    @Autowired
    private UnitRepository unitRepository;

    @GetMapping("/tenants")
    public List<Tenant> getTenants() {
        return waterService.getAllTenants();
    }

    @PostMapping("/units")
    public Unit addUnits(@RequestBody Map<String, Object> payload) {
        Long tenantId = Long.valueOf(payload.get("tenantId").toString());
        String month = payload.get("month").toString();
        Integer units = Integer.valueOf(payload.get("units").toString());
        return waterService.addUnits(tenantId, month, units);
    }

    @GetMapping("/dashboard")
    public Map<String, Object> getDashboard(@RequestParam String month) {
        return waterService.getDashboardData(month);
    }
    
    @GetMapping("/usage")
    public List<Map<String, Object>> getUsage(@RequestParam String month) {
        return waterService.getTenantUsage(month);
    }

    @PostMapping("/bill")
    public void setBill(@RequestBody BillRequestDTO billRequest) {
        waterService.setBill(billRequest.getMonth(), billRequest.getTotalBill(), billRequest.getTotalUnits());
    }

    @GetMapping("/payments")
    public List<Payment> getPayments(@RequestParam String month) {
        return waterService.getPaymentsByMonth(month);
    }

    @PostMapping("/payments")
    public Payment addPayment(@RequestBody Map<String, Object> payload) {
        Long tenantId = Long.valueOf(payload.get("tenantId").toString());
        String month = payload.get("month") != null ? payload.get("month").toString() : "Current";
        BigDecimal amount = new BigDecimal(payload.get("amount").toString());
        return waterService.addPayment(tenantId, month, amount);
    }

    @GetMapping("/tenant-summary")
    public List<Map<String, Object>> getTenantSummary(@RequestParam String month) {
        return waterService.getTenantSummary(month);
    }

    @PostMapping("/register")
    public Tenant register(@RequestBody Map<String, String> payload) {
        String name = payload.get("name");
        String phone = payload.get("phone");
        return waterService.registerTenant(name, phone);
    }

    @PostMapping("/login")
    public Tenant login(@RequestBody Map<String, String> payload) {
        String phone = payload.get("phone");
        return waterService.loginByPhone(phone);
    }

    @GetMapping("/current-user")
    public Tenant getCurrentUser(@RequestParam Long tenantId) {
        return waterService.getTenantById(tenantId);
    }

    @GetMapping("/tenant-units")
    public Unit getTenantUnits(@RequestParam Long tenantId, @RequestParam String month) {
        return unitRepository.findByTenantIdAndMonth(tenantId, month).orElse(new Unit());
    }

    @PostMapping("/admin-check")
    public Map<String, Object> checkAdmin(@RequestBody Map<String, String> payload) {
        String phone = payload.get("phone");
        boolean isAdmin = waterService.isAdmin(phone);
        Map<String, Object> result = new HashMap<>();
        result.put("isAdmin", isAdmin);
        return result;
    }

    @GetMapping("/tenants/{id}")
    public Tenant getTenant(@PathVariable Long id) {
        return waterService.getTenantById(id);
    }

    @PostMapping("/tenants/create")
    public Tenant createTenant(@RequestBody Map<String, Object> payload) {
        String name = payload.get("name").toString();
        String phone = payload.get("phone").toString();
        String roleStr = payload.get("role") != null ? payload.get("role").toString() : "TENANT";
        Integer prevUnits = payload.get("previousUnits") != null ? Integer.valueOf(payload.get("previousUnits").toString()) : 0;
        String doorNumber = payload.get("doorNumber") != null ? payload.get("doorNumber").toString() : null;
        
        Tenant.Role role = "ADMIN".equalsIgnoreCase(roleStr) ? Tenant.Role.ADMIN : Tenant.Role.TENANT;
        return waterService.createTenant(name, phone, role, prevUnits, doorNumber);
    }

    @PutMapping("/tenants/{id}")
    public Tenant updateTenant(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        String name = payload.get("name").toString();
        String phone = payload.get("phone").toString();
        String roleStr = payload.get("role") != null ? payload.get("role").toString() : "TENANT";
        Integer prevUnits = payload.get("previousUnits") != null ? Integer.valueOf(payload.get("previousUnits").toString()) : 0;
        String doorNumber = payload.get("doorNumber") != null ? payload.get("doorNumber").toString() : null;
        
        Tenant.Role role = "ADMIN".equalsIgnoreCase(roleStr) ? Tenant.Role.ADMIN : Tenant.Role.TENANT;
        return waterService.updateTenant(id, name, phone, role, prevUnits, doorNumber);
    }

    @DeleteMapping("/tenants/{id}")
    public Map<String, String> deleteTenant(@PathVariable Long id) {
        try {
            waterService.deleteTenant(id);
            Map<String, String> result = new HashMap<>();
            result.put("message", "Tenant deleted successfully");
            return result;
        } catch (Exception e) {
            System.err.println("Delete Tenant Error: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Could not delete tenant: " + e.getMessage());
        }
    }

    @PostMapping("/tenants/{id}/baseline")
    public Tenant updateBaseline(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        try {
            Object unitsObj = payload.get("previousUnits");
            Integer units = unitsObj != null ? Integer.valueOf(unitsObj.toString()) : 0;
            return waterService.updateTenantBaseline(id, units);
        } catch (Exception e) {
            System.err.println("Baseline Update Error: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to update baseline: " + e.getMessage());
        }
    }
}
