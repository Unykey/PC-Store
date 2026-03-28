package com.sba301.code.be.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "product_specification")
@Getter
@Setter
@NoArgsConstructor
public class ProductSpecification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long productSpecificationId;

    private String specKey;

    private String specValue;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

}
