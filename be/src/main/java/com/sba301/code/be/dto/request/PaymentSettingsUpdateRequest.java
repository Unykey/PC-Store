package com.sba301.code.be.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class PaymentSettingsUpdateRequest {
    private BigDecimal monthlyInstallmentRate;
    private BigDecimal monthlyOverduePenaltyRate;
    private Integer overdueGraceDays;
}
