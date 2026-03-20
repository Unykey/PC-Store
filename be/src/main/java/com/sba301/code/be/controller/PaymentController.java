package com.sba301.code.be.controller;

import com.sba301.code.be.dto.request.CashPaymentRequest;
import com.sba301.code.be.dto.request.MomoCreatePaymentRequest;
import com.sba301.code.be.dto.request.MomoIpnRequest;
import com.sba301.code.be.dto.response.ApiResponse;
import com.sba301.code.be.dto.response.CashPaymentResponse;
import com.sba301.code.be.dto.response.MomoCreatePaymentResponse;
import com.sba301.code.be.security.CustomUserDetails;
import com.sba301.code.be.service.PaymentService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@AllArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/cash/pay")
    public ResponseEntity<ApiResponse<CashPaymentResponse>> payWithCash(
            @RequestBody CashPaymentRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        CashPaymentResponse response = paymentService.payWithCash(request, currentUser.getAccountId());
        return ResponseEntity.ok(ApiResponse.success(response, "Cash payment confirmed"));
    }

    @PostMapping("/momo/create")
    public ResponseEntity<ApiResponse<MomoCreatePaymentResponse>> createMomoPayment(
            @RequestBody MomoCreatePaymentRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        MomoCreatePaymentResponse data = paymentService.createMomoPayment(request, currentUser.getAccountId());
        return ResponseEntity.ok(ApiResponse.success(data, "MoMo payment created"));
    }

    @PostMapping("/momo/ipn")
    public ResponseEntity<Map<String, Object>> momoIpn(@RequestBody MomoIpnRequest request) {
        String result = paymentService.handleMomoIpn(request);
        if ("OK".equals(result)) {
            return ResponseEntity.ok(Map.of("resultCode", 0, "message", "Success"));
        }
        return ResponseEntity.ok(Map.of("resultCode", 1, "message", result));
    }
}
