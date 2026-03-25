package com.sba301.code.be.dto.request;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class ProductRequest {
    private String name;
    private String description;
    private BigDecimal price;
    private int stockQuantity;
    private String serialNumber;
    private Long categoryId;
    private List<ProductSpecificationRequest> specifications;
}
