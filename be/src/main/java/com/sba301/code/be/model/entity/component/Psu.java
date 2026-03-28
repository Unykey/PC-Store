package com.sba301.code.be.model.entity.component;

import com.sba301.code.be.model.entity.PcComponent;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "component_psu")
@PrimaryKeyJoinColumn(name = "product_id")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Psu extends PcComponent {

    @Column(nullable = false)
    private Integer wattage;      // Công suất (W). Ví dụ: 650, 750, 850

    private String efficiencyRating; // Ví dụ: 80 Plus Bronze, Gold, Platinum

    private String modularType;   // Ví dụ: Full Modular, Semi Modular, Non Modular

    private String formFactor;    // Ví dụ: ATX, SFX (quan trọng khi chọn Case nhỏ)
}