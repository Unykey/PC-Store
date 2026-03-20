package com.sba301.code.be.model.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "pc_component")
@PrimaryKeyJoinColumn(name = "product_id") // Join với bảng Product qua ID này
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public abstract class PcComponent extends Product {

    @Column(name = "manufacturer")
    private String manufacturer; // Hãng sản xuất (Intel, AMD, Asus...)

    @Column(name = "warranty_months")
    private Integer warrantyMonths; // Bảo hành (tháng)
}
