package com.sba301.code.be.dto.response;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
public class MonthlySalesPointResponse {
    private String month; // e.g. "Jan"
    private BigDecimal sales;
    private long orders;

    public MonthlySalesPointResponse(String month, BigDecimal sales, long orders) {
        this.month = month;
        this.sales = sales;
        this.orders = orders;
    }
}

