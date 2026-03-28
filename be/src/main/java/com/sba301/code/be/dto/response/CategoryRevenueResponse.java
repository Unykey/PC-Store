package com.sba301.code.be.dto.response;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
public class CategoryRevenueResponse {
    private Long categoryId;
    private String name;
    private BigDecimal revenue;

    public CategoryRevenueResponse(Long categoryId, String name, BigDecimal revenue) {
        this.categoryId = categoryId;
        this.name = name;
        this.revenue = revenue;
    }
}

