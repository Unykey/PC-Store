package com.sba301.code.be.dto.response;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ProductSpecificationResponse {
    private Long productSpecificationId;
    private String specKey;
    private String specValue;
    private Long productId;
}
