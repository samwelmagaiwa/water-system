package com.water.water_system.service;

import com.water.water_system.entity.Bill;
import com.water.water_system.entity.Tenant;
import com.water.water_system.entity.Unit;
import com.water.water_system.entity.Payment;
import com.water.water_system.repository.BillRepository;
import com.water.water_system.repository.TenantRepository;
import com.water.water_system.repository.UnitRepository;
import com.water.water_system.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
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

    /**
     * Record water units for a tenant in a specific month.
     */
    public Unit addUnits(Long tenantId, String month, Integer units) {
        if (units == null || units < 0) throw new IllegalArgumentException("Units cannot be negative");
        
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new RuntimeException("Tenant not found with ID: " + tenantId));

        Unit unit = unitRepository.findByTenantIdAndMonth(tenantId, month)
                .orElse(new Unit());
        
        unit.setTenant(tenant);
        unit.setMonth(month);
        unit.setUnits(units);
        
        return unitRepository.save(unit);
    }

     /**
      * Get overall dashboard data for a specific month.
      */
     public Map<String, Object> getDashboardData(String month) {
         BigDecimal totalBill = billRepository.findByMonth(month)
                 .map(bill -> bill.getTotalBill()).orElse(BigDecimal.ZERO);

         // Total cost charged to tenants (sum of all individual bills)
         List<Map<String, Object>> summary = getTenantSummary(month);
         BigDecimal totalTenantCost = summary.stream()
                 .map(m -> (BigDecimal) m.getOrDefault("cost", BigDecimal.ZERO))
                 .reduce(BigDecimal.ZERO, BigDecimal::add);

         // Profit/Loss Margin (What we collect vs What we owe DAWASA)
         BigDecimal margin = totalTenantCost.subtract(totalBill);

         // Actual collected amount from payments
         List<Payment> paymentsForMonth = paymentRepository.findByMonth(month);
         BigDecimal totalCollected = paymentsForMonth.stream()
                 .map(payment -> payment.getAmount())
                 .reduce(BigDecimal.ZERO, BigDecimal::add);

         // Outstanding is based on what tenants still owe us
         BigDecimal outstanding = totalTenantCost.subtract(totalCollected);

         Map<String, Object> dashboard = new HashMap<>();
         dashboard.put("month", month);
         dashboard.put("totalBill", totalBill);
         dashboard.put("totalTenantCost", totalTenantCost);
         dashboard.put("margin", margin);
         dashboard.put("collected", totalCollected);
         dashboard.put("outstanding", outstanding);
         
         BigDecimal paidPercentage = BigDecimal.ZERO;
         if (totalTenantCost.compareTo(BigDecimal.ZERO) > 0) {
             paidPercentage = totalCollected.multiply(new BigDecimal("100"))
                     .divide(totalTenantCost, 2, RoundingMode.HALF_UP);
          }
          dashboard.put("paidPercentage", paidPercentage);
 
          return dashboard;
      }

    /**
     * Set the total water bill for the entire house for a specific month.
     */
    public Bill setBill(String month, BigDecimal totalBill, Integer totalUnits) {
        if (totalBill == null || totalBill.compareTo(BigDecimal.ZERO) < 0) 
            throw new IllegalArgumentException("Bill amount cannot be negative");
            
        Bill bill = billRepository.findByMonth(month).orElse(new Bill());
        bill.setMonth(month);
        bill.setTotalBill(totalBill);
        bill.setTotalUnits(totalUnits);
        return billRepository.save(bill);
    }

    /**
     * Get all payments recorded for a specific month.
     */
    public List<Payment> getPaymentsByMonth(String month) {
        return paymentRepository.findByMonth(month);
    }

    /**
     * Record or update a payment for a tenant for a specific billing month.
     * If a payment already exists for this tenant and month, it updates the amount (fixing errors).
     */
    /**
     * Record or update a payment for a tenant for a specific billing month.
     * This replaces all existing payments for the month with a single new total (fixing errors).
     */
    public Payment addPayment(Long tenantId, String month, BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) < 0) 
            throw new IllegalArgumentException("Payment amount cannot be negative");
            
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new RuntimeException("Tenant not found"));
        
        // Definitively clear any existing payments for this month before saving the new one
        paymentRepository.deleteByTenantIdAndMonth(tenantId, month);
        
        Payment payment = new Payment();
        payment.setTenant(tenant);
        payment.setMonth(month);
        payment.setAmount(amount);
        payment.setDate(LocalDate.now());
        return paymentRepository.save(payment);
    }

    /**
     * Get a comprehensive summary of all tenants, their usage, and payment status for a month.
     */
    public List<Map<String, Object>> getTenantSummary(String month) {
        List<Tenant> tenants = tenantRepository.findAll();
        List<Unit> currentUnits = unitRepository.findByMonth(month);
        List<Payment> payments = paymentRepository.findByMonth(month);
        Bill monthBill = billRepository.findByMonth(month).orElse(null);
        
        BigDecimal totalBillAmount = (monthBill != null) ? monthBill.getTotalBill() : BigDecimal.ZERO;
        int totalUnitsConsumed = (monthBill != null && monthBill.getTotalUnits() != null) ? monthBill.getTotalUnits() : 0;
        
        BigDecimal finalPrice = new BigDecimal("1700");
        return tenants.stream().map(tenant -> {
            Map<String, Object> map = new HashMap<>();
            map.put("tenantId", tenant.getId());
            map.put("name", tenant.getName());
            map.put("phone", tenant.getPhone());
            map.put("doorNumber", tenant.getDoorNumber());
            
            // Baseline from Tenant Profile
            int prevUnits = tenant.getPreviousUnits() != null ? tenant.getPreviousUnits() : 0;
            map.put("previousUnits", prevUnits);

            // Current Reading (from Units table)
            int currentReading = currentUnits.stream()
                .filter(u -> u.getTenant().getId().equals(tenant.getId()))
                .findFirst().map(Unit::getUnits).orElse(prevUnits); 
            
            // Billable Usage = Current - Previous
            int unitsConsumed = Math.max(0, currentReading - prevUnits);
            
            BigDecimal cost = finalPrice.multiply(new BigDecimal(unitsConsumed));
            map.put("units", currentReading); 
            map.put("billUnit", unitsConsumed); 
            map.put("cost", cost);
            
            // Payments
            BigDecimal totalPaid = payments.stream()
                .filter(p -> p.getTenant().getId().equals(tenant.getId()))
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            map.put("paid", totalPaid);
            map.put("due", cost.subtract(totalPaid));
            map.put("status", totalPaid.compareTo(cost) >= 0 && cost.compareTo(BigDecimal.ZERO) > 0 ? "PAID" : "PENDING");
            
            return map;
        }).collect(Collectors.toList());
    }

    private String getPreviousMonth(String month) {
        List<String> months = List.of("January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December");
        int idx = months.indexOf(month);
        if (idx <= 0) return months.get(11); // Loop back to Dec
        return months.get(idx - 1);
    }

    // --- Tenant Management ---

    public Tenant createTenant(String name, String phone, Tenant.Role role, Integer previousUnits, String doorNumber) {
        if (tenantRepository.findByPhone(phone).isPresent()) 
            throw new RuntimeException("Tenant with this phone already exists");
            
        Tenant tenant = new Tenant();
        tenant.setName(name);
        tenant.setPhone(phone);
        tenant.setRole(role != null ? role : Tenant.Role.TENANT);
        tenant.setPreviousUnits(previousUnits != null ? previousUnits : 0);
        tenant.setDoorNumber(doorNumber);
        return tenantRepository.save(tenant);
    }

    public Tenant updateTenant(Long id, String name, String phone, Tenant.Role role, Integer previousUnits, String doorNumber) {
        Tenant tenant = getTenantById(id);
        tenant.setName(name);
        tenant.setPhone(phone);
        tenant.setRole(role);
        tenant.setPreviousUnits(previousUnits != null ? previousUnits : 0);
        tenant.setDoorNumber(doorNumber);
        return tenantRepository.save(tenant);
    }

    public void deleteTenant(Long id) {
        Tenant tenant = getTenantById(id);
        unitRepository.deleteAll(tenant.getUnits());
        paymentRepository.deleteAll(tenant.getPayments());
        tenantRepository.delete(tenant);
    }

    public Tenant updateTenantBaseline(Long id, Integer previousUnits) {
        Tenant tenant = getTenantById(id);
        tenant.setPreviousUnits(previousUnits != null ? previousUnits : 0);
        return tenantRepository.save(tenant);
    }

    // --- Auth & Helper ---

    public Tenant registerTenant(String name, String phone) {
        Tenant.Role role = determineRole(phone);
        return createTenant(name, phone, role, 0, null);
    }

    public Tenant loginByPhone(String phone) {
        return tenantRepository.findByPhone(phone)
                .orElseThrow(() -> new RuntimeException("User not found with phone: " + phone));
    }

    public Tenant getTenantById(Long id) {
        return tenantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tenant not found"));
    }

    public boolean isAdmin(String phone) {
        return determineRole(phone) == Tenant.Role.ADMIN;
    }

    private Tenant.Role determineRole(String phone) {
        // Simple logic for admin seeding, can be moved to config
        List<String> adminPhones = List.of("2557000000", "0617919104", "0700000001");
        if (phone != null && adminPhones.stream().anyMatch(phone::contains)) {
            return Tenant.Role.ADMIN;
        }
        return Tenant.Role.TENANT;
    }

    public List<Map<String, Object>> getTenantUsage(String month) {
        return getTenantSummary(month); // Leverages the optimized summary logic
    }
}
