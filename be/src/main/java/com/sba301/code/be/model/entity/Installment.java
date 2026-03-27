package com.sba301.code.be.model.entity;

import com.sba301.code.be.model.enums.InstallmentStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "installment")
@Getter
@Setter
@NoArgsConstructor
public class Installment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Which month this installment is (1 = first month, 2 = second, ...) */
    @Column(nullable = false)
    private int monthNumber;

    /** Scheduled due date for this installment */
    @Column(nullable = false)
    private LocalDate dueDate;

    /** Actual date the customer paid; null if not yet paid */
    private LocalDate paidDate;

    /** Amount due for this installment */
    @Column(nullable = false)
    private BigDecimal amount;

    /** Principal amount for this installment (without interest/penalty) */
    @Column(nullable = false)
    private BigDecimal principalAmount = BigDecimal.ZERO;

    /** Flat interest amount configured by admin at schedule creation time */
    @Column(nullable = false)
    private BigDecimal interestAmount = BigDecimal.ZERO;

    /** Overdue fee added when installment becomes overdue */
    @Column(nullable = false)
    private BigDecimal overdueFee = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InstallmentStatus installmentStatus = InstallmentStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;
}
