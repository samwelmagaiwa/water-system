package com.water.water_system.dto;

public class UnitDTO {
    private Long id;
    private Long tenantId;
    private String month;
    private Integer units;
    
    public UnitDTO() {}
    
    public UnitDTO(Long id, Long tenantId, String month, Integer units) {
        this.id = id;
        this.tenantId = tenantId;
        this.month = month;
        this.units = units;
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
    
    public String getMonth() {
        return month;
    }
    
    public void setMonth(String month) {
        this.month = month;
    }
    
    public Integer getUnits() {
        return units;
    }
    
    public void setUnits(Integer units) {
        this.units = units;
    }
}