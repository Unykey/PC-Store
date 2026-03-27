package com.sba301.code.be.model.entity.component;

import com.sba301.code.be.model.entity.PcComponent;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "component_case")
@PrimaryKeyJoinColumn(name = "product_id")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PcCase extends PcComponent {

    @Column(nullable = false)
    private String formFactor;      // Loại case: Mid Tower, Full Tower, Mini ITX

    // Các loại mainboard hỗ trợ (Lưu dạng chuỗi CSV hoặc JSON nếu đơn giản)
    // Ví dụ: "ATX, Micro-ATX, Mini-ITX"
    private String supportedMotherboards;

    private Integer maxGpuLength;   // Chiều dài GPU tối đa (mm). Ví dụ: 340
    private Integer maxCpuCoolerHeight; // Chiều cao tản nhiệt khí tối đa (mm). Ví dụ: 160
    private String material;        // Chất liệu: Thép, Kính cường lực...
}