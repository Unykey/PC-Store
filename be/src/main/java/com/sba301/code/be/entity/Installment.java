package com.sba301.code.be.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "installment_tbl")
@Data
public class Installment {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int paymentId;

    @Column(nullable = false)
    private String method;

    @Column(nullable = false)
    private String status;

    @Column(nullable = false)
    private float amountPaid;

    @Column(nullable = false)
    private LocalDateTime transactionDate;

    @ManyToOne
    @JoinColumn(name = "order_id")
    private Order order;
}
