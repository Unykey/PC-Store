package com.sba301.code.be.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.sba301.code.be.model.entity.Product;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Nationalized;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "category")
@Getter
@Setter
@NoArgsConstructor
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long categoryId;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Nationalized
    @Column(nullable = false, length = 500)
    private String description;

    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL)
    @JsonIgnore
    private Set<Product> products = new HashSet<>();

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
