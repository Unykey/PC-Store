package com.sba301.code.be.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Set;

@Entity
@Table
@Getter
@Setter
@NoArgsConstructor
public class Brand {
    @Id
    @GeneratedValue (strategy = GenerationType.AUTO)
    private Long brandId;
    @Column
    private String brandName;

    @OneToMany (mappedBy = "brandId", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<Product> product;

    Product addProduct(Product product) {
        this.product.add(product);
        product.setBrand(this);
        return product;
    }
    Product removeProduct(Product product) {
        this.product.remove(product);
        product.setBrand(null);
        return product;
    }
}
