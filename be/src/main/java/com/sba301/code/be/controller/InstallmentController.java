package com.sba301.code.be.controller;

import com.sba301.code.be.dto.response.ApiResponse;
import com.sba301.code.be.dto.response.AdminInstallmentPaymentResponse;
import com.sba301.code.be.dto.response.AdminInstallmentMonitoringSummaryResponse;
import com.sba301.code.be.dto.response.AdminInstallmentContractResponse;
import com.sba301.code.be.dto.response.InstallmentResponse;
import com.sba301.code.be.security.CustomUserDetails;
import com.sba301.code.be.service.InstallmentService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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

    /** Admin: list paid installments and who paid by month/year */
    @GetMapping("/admin/paid")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<AdminInstallmentPaymentResponse>>> getAdminPaidInstallments(
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {
        List<AdminInstallmentPaymentResponse> result = installmentService.getPaidInstallments(month, year);
        return ResponseEntity.ok(ApiResponse.success(result, "Paid installments fetched successfully"));
    }

    /** Admin: installment portfolio summary for monitoring */
    @GetMapping("/admin/monitoring/summary")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AdminInstallmentMonitoringSummaryResponse>> getAdminMonitoringSummary(
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {
        AdminInstallmentMonitoringSummaryResponse result = installmentService.getAdminMonitoringSummary(month, year);
        return ResponseEntity.ok(ApiResponse.success(result, "Installment monitoring summary fetched successfully"));
    }

    /** Admin: installment contracts monitoring list */
    @GetMapping("/admin/contracts")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<AdminInstallmentContractResponse>>> getAdminInstallmentContracts(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String contractState) {
        List<AdminInstallmentContractResponse> result = installmentService.getAdminInstallmentContracts(q,
                contractState);
        return ResponseEntity.ok(ApiResponse.success(result, "Installment contracts fetched successfully"));
    }
}
