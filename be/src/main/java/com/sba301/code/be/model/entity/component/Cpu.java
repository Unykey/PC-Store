package com.sba301.code.be.model.entity.component;

import com.sba301.code.be.model.entity.PcComponent;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "component_cpu")
@PrimaryKeyJoinColumn(name = "product_id")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Cpu extends PcComponent {

    private String socket;       // Ví dụ: LGA1700, AM5
    private Integer cores;       // Số nhân
    private Integer threads;     // Số luồng
    private Double baseClock;    // Xung cơ bản (GHz)
    private Double turboClock;   // Xung boost (GHz)

    @Column(nullable = false)
    private Integer tdp;         // Công suất tiêu thụ (W) - Quan trọng để chọn Nguồn

    private Boolean hasIntegratedGpu; // Có iGPU không?
}