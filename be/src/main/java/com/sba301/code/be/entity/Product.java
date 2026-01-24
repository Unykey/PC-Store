package com.sba301.code.be.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.stereotype.Controller;

@Entity
@Table
@Getter
@Setter
@NoArgsConstructor
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long productId;

    @Column (nullable = false)
    private String productName;

    @Column
    private Double price;

    @Column
    private String description;

    @Column (nullable = false)
    private Integer stockQuantity;

    @Column (nullable = false, unique = true)
    private Long serialNumber;



//    private Long categoryId;
//    private Long brandId;
}
