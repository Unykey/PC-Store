package com.sba301.code.be.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CashPaymentRequest {
    private Long orderId;
    private String note;
}
