package com.sba301.code.be.controller;

import com.sba301.code.be.dto.response.ApiResponse;
import com.sba301.code.be.dto.response.InstallmentResponse;
import com.sba301.code.be.security.CustomUserDetails;
import com.sba301.code.be.service.InstallmentService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/installments")
@AllArgsConstructor
public class InstallmentController {

    private final InstallmentService installmentService;

    /** Get the full installment schedule for a given order */
    @GetMapping("/order/{orderId}")
    public ResponseEntity<ApiResponse<List<InstallmentResponse>>> getByOrder(@PathVariable Long orderId) {
        List<InstallmentResponse> result = installmentService.getByOrderId(orderId);
        return ResponseEntity.ok(ApiResponse.success(result, "Installments fetched successfully"));
    }

    /** Get all installments for the currently authenticated customer */
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<InstallmentResponse>>> getMyInstallments(
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        List<InstallmentResponse> result = installmentService.getByAccountId(currentUser.getAccountId());
        return ResponseEntity.ok(ApiResponse.success(result, "My installments fetched successfully"));
    }

    /** Mark a single installment entry as paid (simulates customer payment) */
    @PutMapping("/{id}/pay")
    public ResponseEntity<ApiResponse<InstallmentResponse>> pay(@PathVariable Long id) {
        InstallmentResponse paid = installmentService.markAsPaid(id);
        return ResponseEntity.ok(ApiResponse.success(paid, "Installment marked as paid"));
    }
}
