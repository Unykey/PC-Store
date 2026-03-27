package com.sba301.code.be.dto.response;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class ProductResponse {
    private Long productId;
    private String name;
    private String description;
    private BigDecimal price;
    private int stockQuantity;
    private String serialNumber;
    private String image;
    private Long categoryId;
    private String categoryName;

    private List<ProductSpecificationResponse> specifications;
}
