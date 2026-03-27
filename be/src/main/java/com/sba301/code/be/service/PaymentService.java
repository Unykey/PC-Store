package com.sba301.code.be.service;

import com.sba301.code.be.dto.request.CashPaymentRequest;
import com.sba301.code.be.dto.request.MomoCreatePaymentRequest;
import com.sba301.code.be.dto.request.MomoIpnRequest;
import com.sba301.code.be.dto.response.CashPaymentResponse;
import com.sba301.code.be.dto.response.MomoCreatePaymentResponse;

public interface PaymentService {
    CashPaymentResponse payWithCash(CashPaymentRequest request, Long accountId);

    MomoCreatePaymentResponse createMomoPayment(MomoCreatePaymentRequest request, Long accountId);

    String handleMomoIpn(MomoIpnRequest request);

    String handleMomoReturnAndGetRedirectUrl(String momoOrderId);
}
