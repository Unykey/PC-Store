package com.sba301.code.be.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment_settings")
@Getter
@Setter
@NoArgsConstructor
public class PaymentSettings {

    @Id
    private Long id = 1L;

    @Column(nullable = false, precision = 5, scale = 4)
    private BigDecimal monthlyInstallmentRate = new BigDecimal("0.0150");

    @Column(nullable = false, precision = 5, scale = 4)
    private BigDecimal monthlyOverduePenaltyRate = new BigDecimal("0.0200");

    @Column(nullable = false)
    private Integer overdueGraceDays = 0;

    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();
}
