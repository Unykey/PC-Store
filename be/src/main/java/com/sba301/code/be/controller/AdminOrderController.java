package com.sba301.code.be.controller;

import com.sba301.code.be.dto.response.AdminOrderStatsResponse;
import com.sba301.code.be.dto.response.ApiResponse;
import com.sba301.code.be.dto.response.OrderResponse;
import com.sba301.code.be.dto.response.PageResponse;
import com.sba301.code.be.model.enums.OrderStatus;
import com.sba301.code.be.service.OrderService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(path = "/api/admin/orders", produces = "application/json")
@AllArgsConstructor
public class AdminOrderController {
    private final OrderService orderService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<OrderResponse>>> listOrders(
            @RequestParam(value = "q", required = false) String q,
            @RequestParam(value = "status", required = false) OrderStatus status,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size
    ) {
        PageResponse<OrderResponse> result = orderService.adminListOrders(q, status, page, size);
        return ResponseEntity.ok(ApiResponse.success(result, "Admin orders retrieved"));
    }

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AdminOrderStatsResponse>> getStats() {
        return ResponseEntity.ok(ApiResponse.success(orderService.adminGetOrderStats(), "Admin order stats retrieved"));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getOrderById(id), "Admin order retrieved"));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<OrderResponse>> updateStatus(
            @PathVariable("id") Long id,
            @RequestParam("status") OrderStatus status
    ) {
        return ResponseEntity.ok(ApiResponse.success(orderService.updateOrderStatus(id, status), "Order status updated"));
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(@PathVariable("id") Long id) {
        OrderResponse cancelled = orderService.adminCancelOrder(id);
        return ResponseEntity.ok(ApiResponse.success(cancelled, "Order cancelled"));
    }
}

