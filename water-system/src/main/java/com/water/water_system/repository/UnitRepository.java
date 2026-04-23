package com.water.water_system.repository;

import com.water.water_system.entity.Unit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UnitRepository extends JpaRepository<Unit, Long> {
    List<Unit> findByMonth(String month);
    Optional<Unit> findByTenantIdAndMonth(Long tenantId, String month);
}
