package com.water.water_system.repository;

import com.water.water_system.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByMonth(String month);
    List<Payment> findByTenantId(Long tenantId);
    List<Payment> findByTenantIdAndMonth(Long tenantId, String month);
    
    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query("DELETE FROM Payment p WHERE p.tenant.id = :tenantId AND p.month = :month")
    void deleteByTenantIdAndMonth(Long tenantId, String month);
}
