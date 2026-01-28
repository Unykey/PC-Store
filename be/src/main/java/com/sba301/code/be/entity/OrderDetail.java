package com.sba301.code.be.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import lombok.Data;

@Entity
@Table(name = "order_detail_tbl")
@Data
public class OrderDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer orderDetailId;

    @Column(nullable = false)
    @Min(1)
    private Integer quantity;

    @Column(nullable = false)
    @Min(1)
    private Float priceAtPurchase;

    @ManyToOne
    @JoinColumn(name = "order_id")
    private Order order;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;
}
