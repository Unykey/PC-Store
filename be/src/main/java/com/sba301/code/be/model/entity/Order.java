package com.sba301.code.be.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.sba301.code.be.model.enums.InstallmentProvider;
import com.sba301.code.be.model.enums.OrderStatus;
import com.sba301.code.be.model.enums.PaymentType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "purchase_order")
@Getter
@Setter
@NoArgsConstructor
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long orderId;

    @Column(nullable = false)
    private LocalDateTime orderDate = LocalDateTime.now();

    @Column(nullable = false)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus orderStatus;

    /** How the customer pays: full upfront or monthly installments */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentType paymentType = PaymentType.FULL_PAYMENT;

    /** Number of installment months (null when paymentType = FULL_PAYMENT) */
    private Integer installmentMonths;

    /** Installment finance provider (null when paymentType = FULL_PAYMENT) */
    @Enumerated(EnumType.STRING)
    private InstallmentProvider installmentProvider;

    @ManyToOne
    @JoinColumn(name = "account_id")
    private Account account;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Installment> installments = new HashSet<>();

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private Set<OrderDetail> orderDetails = new HashSet<>();
}
