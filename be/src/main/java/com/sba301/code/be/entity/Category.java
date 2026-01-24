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
public class Category {

    @Id
    @GeneratedValue (strategy = GenerationType.AUTO)
    private Long categoryId;

    @Column
    private String categoryName;

    @Column
    private String categoryDescription;

    @OneToMany (mappedBy = "categoryId", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<Product> products;


    Product addProduct(Product product) {
        this.products.add(product);
        product.setCategory(this);
        return product;
    }

    Product removeProduct(Product product) {
        this.products.remove(product);
        product.setCategory(null);
        return product;
    }
}
