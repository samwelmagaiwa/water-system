package com.water.water_system.service;

import com.water.water_system.model.Bill;
import com.water.water_system.model.Tenant;
import com.water.water_system.model.Unit;
import com.water.water_system.model.Payment;
import com.water.water_system.repository.BillRepository;
import com.water.water_system.repository.TenantRepository;
import com.water.water_system.repository.UnitRepository;
import com.water.water_system.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class WaterService {

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private UnitRepository unitRepository;

    @Autowired
    private BillRepository billRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    private static final BigDecimal UNIT_PRICE = new BigDecimal("1700");

    public List<Tenant> getAllTenants() {
        return tenantRepository.findAll();
    }

    public Unit addUnits(Long tenantId, String month, Integer units) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new RuntimeException("Tenant not found"));

        Optional<Unit> existingUnit = unitRepository.findByTenantIdAndMonth(tenantId, month);
        Unit unit;
        if (existingUnit.isPresent()) {
            unit = existingUnit.get();
            unit.setUnits(units);
        } else {
            unit = new Unit();
            unit.setTenant(tenant);
            unit.setMonth(month);
            unit.setUnits(units);
        }
        return unitRepository.save(unit);
    }

    public Map<String, Object> getDashboardData(String month) {
        Optional<Bill> billOpt = billRepository.findByMonth(month);
        BigDecimal totalBill = billOpt.map(Bill::getTotalBill).orElse(BigDecimal.ZERO);

        List<Unit> unitsForMonth = unitRepository.findByMonth(month);
        BigDecimal totalContributions = unitsForMonth.stream()
                .map(unit -> UNIT_PRICE.multiply(new BigDecimal(unit.getUnits())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal remainingDebt = totalBill.subtract(totalContributions);

        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("month", month);
        dashboard.put("totalBill", totalBill);
        dashboard.put("totalContributions", totalContributions);
        dashboard.put("remainingDebt", remainingDebt);
        
        double paidPercentage = 0;
        if (totalBill.compareTo(BigDecimal.ZERO) > 0) {
            paidPercentage = totalContributions.multiply(new BigDecimal("100"))
                    .divide(totalBill, 2, BigDecimal.ROUND_HALF_UP).doubleValue();
        }
        dashboard.put("paidPercentage", paidPercentage);

        return dashboard;
    }
    
    public List<Map<String, Object>> getTenantUsage(String month) {
        List<Tenant> tenants = tenantRepository.findAll();
        List<Unit> units = unitRepository.findByMonth(month);
        
        return tenants.stream().map(tenant -> {
            Map<String, Object> map = new HashMap<>();
            map.put("tenantId", tenant.getId());
            map.put("name", tenant.getName());
            
            Optional<Unit> unitOpt = units.stream()
                    .filter(u -> u.getTenant().getId().equals(tenant.getId()))
                    .findFirst();
            
            int unitsConsumed = unitOpt.map(Unit::getUnits).orElse(0);
            map.put("units", unitsConsumed);
            map.put("cost", UNIT_PRICE.multiply(new BigDecimal(unitsConsumed)));
            return map;
        }).toList();
    }

    public void setBill(String month, BigDecimal totalBill) {
        Bill bill = billRepository.findByMonth(month).orElse(new Bill());
        bill.setMonth(month);
        bill.setTotalBill(totalBill);
        billRepository.save(bill);
    }

    public List<Payment> getPaymentsByMonth(String month) {
        return paymentRepository.findAll().stream()
                .filter(p -> p.getDate() != null && p.getDate().getMonth().name().equalsIgnoreCase(month))
                .toList();
    }

    public Payment addPayment(Long tenantId, BigDecimal amount) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new RuntimeException("Tenant not found"));
        Payment payment = new Payment();
        payment.setTenant(tenant);
        payment.setAmount(amount);
        payment.setDate(LocalDate.now());
        return paymentRepository.save(payment);
    }

    public List<Map<String, Object>> getTenantSummary(String month) {
        List<Tenant> tenants = tenantRepository.findAll();
        List<Unit> units = unitRepository.findByMonth(month);
        
        return tenants.stream().map(tenant -> {
            Map<String, Object> map = new HashMap<>();
            map.put("tenantId", tenant.getId());
            map.put("name", tenant.getName());
            
            Optional<Unit> unitOpt = units.stream()
                    .filter(u -> u.getTenant().getId().equals(tenant.getId()))
                    .findFirst();
            
            int unitsConsumed = unitOpt.map(Unit::getUnits).orElse(0);
            BigDecimal cost = UNIT_PRICE.multiply(new BigDecimal(unitsConsumed));
            map.put("units", unitsConsumed);
            map.put("cost", cost);
            
            List<Payment> payments = paymentRepository.findAll().stream()
                    .filter(p -> p.getTenant().getId().equals(tenant.getId()))
                    .toList();
            BigDecimal totalPaid = payments.stream()
                    .map(Payment::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            map.put("paid", totalPaid);
            map.put("due", cost.subtract(totalPaid));
            map.put("status", totalPaid.compareTo(cost) >= 0 ? "PAID" : "PENDING");
            
            return map;
        }).toList();
    }

public Tenant registerTenant(String name, String phone) {
        Tenant.Role role = determineRole(phone);
        return createTenant(name, phone, role);
    }
    
    public boolean isAdmin(String phone) {
        return determineRole(phone) == Tenant.Role.ADMIN;
    }
    
    private Tenant.Role determineRole(String phone) {
        if (phone != null && phone.startsWith("2557000000")) {
            return Tenant.Role.ADMIN;
        }
        return Tenant.Role.TENANT;
    }

    public Tenant createTenant(String name, String phone, Tenant.Role role) {
        Tenant tenant = new Tenant();
        tenant.setName(name);
        tenant.setPhone(phone);
        tenant.setRole(role);
        return tenantRepository.save(tenant);
    }

    public Tenant updateTenant(Long id, String name, String phone, Tenant.Role role) {
        Tenant tenant = getTenantById(id);
        tenant.setName(name);
        tenant.setPhone(phone);
        tenant.setRole(role);
        return tenantRepository.save(tenant);
    }

    public void deleteTenant(Long id) {
        tenantRepository.deleteById(id);
    }

    public Tenant loginByPhone(String phone) {
        return tenantRepository.findByPhone(phone)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public Tenant getTenantById(Long id) {
        return tenantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tenant not found"));
    }
}
