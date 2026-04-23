package com.water.water_system.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class PaymentDTO {
    private Long id;
    private Long tenantId;
    private BigDecimal amount;
    private String month;
    private LocalDate date;
    
    public PaymentDTO() {}
    
    public PaymentDTO(Long id, Long tenantId, BigDecimal amount, String month, LocalDate date) {
        this.id = id;
        this.tenantId = tenantId;
        this.amount = amount;
        this.month = month;
        this.date = date;
    }
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getTenantId() {
        return tenantId;
    }
    
    public void setTenantId(Long tenantId) {
        this.tenantId = tenantId;
    }
    
    public BigDecimal getAmount() {
        return amount;
    }
    
    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
    
    public String getMonth() {
        return month;
    }
    
    public void setMonth(String month) {
        this.month = month;
    }
    
    public LocalDate getDate() {
        return date;
    }
    
    public void setDate(LocalDate date) {
        this.date = date;
    }
}