package com.sba301.code.be.model.entity.component;

import com.sba301.code.be.model.entity.PcComponent;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "component_gpu")
@PrimaryKeyJoinColumn(name = "product_id")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Gpu extends PcComponent {

    private String chipset;      // Ví dụ: RTX 4060, RX 7800 XT
    private Integer vram;        // Dung lượng VRAM (GB). Quan trọng cho AI/Render

    @Column(nullable = false)
    private Integer recommendedPsu; // Nguồn khuyến nghị (W). Ví dụ: 650

    private Integer lengthMm;    // Độ dài (mm) để xem có vừa vỏ Case không
}