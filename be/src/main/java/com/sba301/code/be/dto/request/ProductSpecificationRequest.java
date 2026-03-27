package com.sba301.code.be.dto.request;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ProductSpecificationRequest {
    private String specKey;
    private String specValue;
    private Long productId;
}
