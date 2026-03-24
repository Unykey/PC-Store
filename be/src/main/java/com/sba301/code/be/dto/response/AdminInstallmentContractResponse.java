package com.sba301.code.be.dto.response;

import com.sba301.code.be.model.enums.OrderStatus;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
public class AdminInstallmentContractResponse {
    private Long orderId;
    private Long accountId;
    private String customerName;
    private String customerEmail;
    private String customerPhone;

    private OrderStatus orderStatus;
    private Integer totalMonths;
    private Integer paidMonths;
    private Integer overdueMonths;

    private BigDecimal totalAmount = BigDecimal.ZERO;
    private BigDecimal paidAmount = BigDecimal.ZERO;
    private BigDecimal remainingAmount = BigDecimal.ZERO;

    private LocalDate nextDueDate;
    private BigDecimal nextDueAmount = BigDecimal.ZERO;
    private LocalDate lastPaidDate;

    private String riskLevel;
}
