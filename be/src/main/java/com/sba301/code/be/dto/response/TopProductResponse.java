package com.sba301.code.be.dto.response;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
public class TopProductResponse {
    private Long productId;
    private String productName;
    private String serialNumber;
    private int totalQuantitySold;
    private BigDecimal totalSalesAmount; // sum(priceAtPurchase * quantity)
}

