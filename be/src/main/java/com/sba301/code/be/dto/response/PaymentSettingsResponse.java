package com.sba301.code.be.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class PaymentSettingsResponse {
    private BigDecimal monthlyInstallmentRate;
    private BigDecimal monthlyOverduePenaltyRate;
    private Integer overdueGraceDays;
    private LocalDateTime updatedAt;
}
