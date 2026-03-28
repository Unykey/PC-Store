package com.sba301.code.be.model.entity.component;

import com.sba301.code.be.model.entity.PcComponent;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "component_storage")
@PrimaryKeyJoinColumn(name = "product_id")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Storage extends PcComponent {

    @Column(nullable = false)
    private String type;        // Ví dụ: SSD, HDD

    @Column(nullable = false)
    private String formFactor;  // Ví dụ: M.2 2280, 2.5 inch, 3.5 inch

    @Column(nullable = false)
    private String interfaceType; // Ví dụ: NVMe PCIe Gen4, SATA III

    @Column(nullable = false)
    private Integer capacity;   // Dung lượng (GB). Ví dụ: 512, 1024, 2048

    private Integer readSpeed;  // Tốc độ đọc (MB/s). Ví dụ: 7000
    private Integer writeSpeed; // Tốc độ ghi (MB/s). Ví dụ: 5000
}