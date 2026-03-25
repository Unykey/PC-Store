package com.sba301.code.be.controller;

import com.sba301.code.be.dto.response.AdminReviewResponse;
import com.sba301.code.be.dto.response.ApiResponse;
import com.sba301.code.be.model.enums.ReviewStatus;
import com.sba301.code.be.service.ReviewService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(path = "/api/admin/reviews", produces = "application/json")
@AllArgsConstructor
public class AdminReviewController {
    private final ReviewService reviewService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<AdminReviewResponse>>> list(
            @RequestParam(value = "q", required = false) String q,
            @RequestParam(value = "status", required = false) ReviewStatus status
    ) {
        return ResponseEntity.ok(ApiResponse.success(reviewService.adminList(q, status), "Reviews retrieved"));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AdminReviewResponse>> updateStatus(
            @PathVariable Long id,
            @RequestParam ReviewStatus status
    ) {
        return ResponseEntity.ok(ApiResponse.success(reviewService.adminUpdateStatus(id, status), "Review status updated"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        reviewService.adminDelete(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Review deleted"));
    }
}

