package com.water.water_system.dto;

import java.math.BigDecimal;

public class BillRequestDTO {
    private String month;
    private BigDecimal totalBill;
    private Integer totalUnits;

    public BillRequestDTO() {}

    public BillRequestDTO(String month, BigDecimal totalBill, Integer totalUnits) {
        this.month = month;
        this.totalBill = totalBill;
        this.totalUnits = totalUnits;
    }

    public String getMonth() {
        return month;
    }

    public void setMonth(String month) {
        this.month = month;
    }

    public BigDecimal getTotalBill() {
        return totalBill;
    }

    public void setTotalBill(BigDecimal totalBill) {
        this.totalBill = totalBill;
    }

    public Integer getTotalUnits() {
        return totalUnits;
    }

    public void setTotalUnits(Integer totalUnits) {
        this.totalUnits = totalUnits;
    }
}