package com.sba301.code.be.controller;

import com.sba301.code.be.dto.request.OrderCreateRequest;
import com.sba301.code.be.dto.response.ApiResponse;
import com.sba301.code.be.dto.response.OrderResponse;
import com.sba301.code.be.model.entity.Order;
import com.sba301.code.be.model.enums.OrderStatus;
import com.sba301.code.be.security.CustomUserDetails;
import com.sba301.code.be.service.OrderService;
import lombok.AllArgsConstructor; // Import Lombok
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@AllArgsConstructor
public class OrderController {
    private final OrderService orderService;

    @PostMapping
        public ResponseEntity<ApiResponse<OrderResponse>> createOrder(@RequestBody OrderCreateRequest request) {
        OrderResponse newOrder = orderService.placeOrder(request);
        return ResponseEntity.ok(ApiResponse.success(newOrder, "Order placed successfully"));
    }

    @GetMapping("/my-orders")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getMyOrders(@AuthenticationPrincipal CustomUserDetails currentUser) {
        List<OrderResponse> orders = orderService.getOrdersByAccountId(currentUser.getAccountId());
        return ResponseEntity.ok(ApiResponse.success(orders, "Get my orders successfully"));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<OrderResponse>> updateStatus(@PathVariable Long id, @RequestParam OrderStatus status) {
        OrderResponse updatedOrder = orderService.updateOrderStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success(updatedOrder, "Update status successfully"));
    }
}
