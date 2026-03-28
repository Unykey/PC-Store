package com.sba301.code.be.model.entity.component;

import com.sba301.code.be.model.entity.PcComponent;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "component_mainboard")
@PrimaryKeyJoinColumn(name = "product_id")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Mainboard extends PcComponent {

    private String socket;          // Phải khớp với CPU. Ví dụ: LGA1700
    private String chipset;         // Ví dụ: Z790, B760
    private String formFactor;      // Ví dụ: ATX, Micro-ATX (để chọn Case)
    private String ramType;         // Ví dụ: DDR4, DDR5 (để chọn Ram)
    private Integer ramSlots;       // Số khe Ram
    private Integer maxRamCapacity; // GB tối đa
}