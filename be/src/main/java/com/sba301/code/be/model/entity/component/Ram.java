package com.sba301.code.be.model.entity.component;

import com.sba301.code.be.model.entity.PcComponent;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "component_ram")
@PrimaryKeyJoinColumn(name = "product_id")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Ram extends PcComponent {

    private String type;        // DDR4, DDR5
    private Integer capacity;   // Dung lượng (GB). Ví dụ: 8, 16, 32
    private Integer busSpeed;   // MHz. Ví dụ: 3200, 5600, 6000
    private Integer kitQuantity; // Số lượng thanh trong 1 kit (1 hoặc 2)
}