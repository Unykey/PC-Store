package com.sba301.code.be.dto.response;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
public class CustomerInsightsResponse {
    private long totalCustomers;
    private long newCustomers; // based on first order in current month
    private long returningCustomers; // total - new (among customers with orders)
    private BigDecimal avgCustomerValue; // total revenue / distinct customers with orders
}

