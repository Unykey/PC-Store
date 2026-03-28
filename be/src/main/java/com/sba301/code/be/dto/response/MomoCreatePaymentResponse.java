package com.sba301.code.be.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class MomoCreatePaymentResponse {
    private String requestId;
    private String orderCode;
    private String payUrl;
    private String deeplink;
    private String qrCodeUrl;
}
