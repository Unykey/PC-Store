package com.sba301.code.be.dto.response;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
public class AdminInstallmentMonitoringSummaryResponse {
    private long totalContracts;
    private long activeContracts;
    private long overdueContracts;
    private long defaultedContracts;

    private BigDecimal totalOutstanding = BigDecimal.ZERO;
    private BigDecimal overdueOutstanding = BigDecimal.ZERO;
    private BigDecimal collectedThisMonth = BigDecimal.ZERO;

    private BigDecimal collectionRate = BigDecimal.ZERO;
}
