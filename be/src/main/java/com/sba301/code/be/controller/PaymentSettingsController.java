package com.sba301.code.be.controller;

import com.sba301.code.be.dto.request.PaymentSettingsUpdateRequest;
import com.sba301.code.be.dto.response.ApiResponse;
import com.sba301.code.be.dto.response.PaymentSettingsResponse;
import com.sba301.code.be.service.PaymentSettingsService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payment-settings")
@AllArgsConstructor
public class PaymentSettingsController {

    private final PaymentSettingsService paymentSettingsService;

    @GetMapping
    public ResponseEntity<ApiResponse<PaymentSettingsResponse>> getSettings() {
        PaymentSettingsResponse response = paymentSettingsService.getSettings();
        return ResponseEntity.ok(ApiResponse.success(response, "Get payment settings successfully"));
    }

    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PaymentSettingsResponse>> updateSettings(
            @RequestBody PaymentSettingsUpdateRequest request) {
        PaymentSettingsResponse response = paymentSettingsService.updateSettings(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Update payment settings successfully"));
    }
}
