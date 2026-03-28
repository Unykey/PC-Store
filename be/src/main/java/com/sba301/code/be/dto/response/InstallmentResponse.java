package com.sba301.code.be.dto.response;

import com.sba301.code.be.model.enums.InstallmentProvider;
import com.sba301.code.be.model.enums.InstallmentStatus;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
public class InstallmentResponse {
    private Long id;
    private Long orderId;
    private InstallmentProvider provider;
    private int totalMonths;
    private int monthNumber;
    private BigDecimal amount;
    private BigDecimal principalAmount;
    private BigDecimal interestAmount;
    private BigDecimal overdueFee;
    private LocalDate dueDate;
    private LocalDate paidDate;
    private InstallmentStatus installmentStatus;
}
