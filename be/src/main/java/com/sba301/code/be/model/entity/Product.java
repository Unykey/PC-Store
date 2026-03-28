package com.sba301.code.be.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import lombok.*;
import org.hibernate.annotations.Nationalized;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "product")
@Inheritance(strategy = InheritanceType.JOINED) // <--- QUAN TRỌNG: Tạo bảng riêng cho từng loại con
@Getter
@Setter
@NoArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long productId;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Nationalized
    @Column(nullable = false, length = 500)
    private String description;

    @Column(nullable = false)
    @Min(0)
    private BigDecimal price;

    @Column(nullable = false)
    @Min(0)
    private int stockQuantity;

    private String imageUrl;

    @Column(unique = true)
    private String serialNumber;

    @Column(length = 255)
    private String image;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL)
    private Set<OrderDetail> orderDetails = new HashSet<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<ProductSpecification> specifications;
}