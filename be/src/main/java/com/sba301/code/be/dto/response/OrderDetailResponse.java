package com.sba301.code.be.dto.response;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
public class OrderDetailResponse {
    private Long productId;
    private String productName;
    private String productImage;
    private int quantity;
    private BigDecimal price;
}