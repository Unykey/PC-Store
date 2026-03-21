package com.sba301.code.be.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MomoIpnRequest {
    private String partnerCode;
    private String requestId;
    private String orderId;
    private String orderInfo;
    private String orderType;
    private String payType;
    private Long responseTime;
    private Long transId;
    private Long amount;
    private Integer resultCode;
    private String message;
    private String extraData;
    private String signature;
}
