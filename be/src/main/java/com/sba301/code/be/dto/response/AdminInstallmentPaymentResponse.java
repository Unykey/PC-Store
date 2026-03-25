package com.sba301.code.be.dto.response;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
public class AdminInstallmentPaymentResponse {
    private Long installmentId;
    private Long orderId;
    private Integer monthNumber;
    private Integer totalMonths;

    private BigDecimal amount;
    private BigDecimal principalAmount;
    private BigDecimal interestAmount;
    private BigDecimal overdueFee;

    private LocalDate dueDate;
    private LocalDate paidDate;

    private Long accountId;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
}

