package com.sba301.code.be.model.entity;

import com.sba301.code.be.model.entity.Product;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "category_tbl")
@Data
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long categoryId;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(nullable = false, length = 500)
    private String description;

    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL)
    private List<Product> products;

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
