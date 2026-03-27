package com.sba301.code.be.model.entity.component;

import com.sba301.code.be.model.entity.PcComponent;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "component_cooler")
@PrimaryKeyJoinColumn(name = "product_id")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Cooler extends PcComponent {

    @Column(name = "cooler_type")
    private String coolerType; // Ví dụ: "Tản khí", "Tản nước AIO"

    @Column(name = "socket_support")
    private String socketSupport; // Ví dụ: "LGA1700, AM4, AM5"

    @Column(name = "fan_size")
    private String fanSize; // Ví dụ: "120mm", "240mm", "360mm"

    @Column(name = "has_rgb")
    private Boolean hasRgb; // true/false
}