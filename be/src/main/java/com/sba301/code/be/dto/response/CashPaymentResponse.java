package com.sba301.code.be.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class CashPaymentResponse {
    private String requestId;
    private String orderCode;
    private String status;
    private String message;
}
