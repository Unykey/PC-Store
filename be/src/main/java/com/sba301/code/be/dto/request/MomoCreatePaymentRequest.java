package com.sba301.code.be.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MomoCreatePaymentRequest {
    private Long orderId;
    private Long installmentId;
    private String orderInfo;
}
