package com.sba301.code.be.service;

import com.sba301.code.be.dto.request.OrderCreateRequest;
import com.sba301.code.be.dto.response.AdminOrderStatsResponse;
import com.sba301.code.be.dto.response.OrderResponse;
import com.sba301.code.be.dto.response.PageResponse;
import com.sba301.code.be.model.enums.OrderStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface OrderService {
    List<OrderResponse> getAllOrders();

    OrderResponse getOrderById(Long orderId);

    List<OrderResponse> getOrdersByAccountId(Long accountId);

    OrderResponse placeOrder(OrderCreateRequest request);

    OrderResponse updateOrderStatus(Long orderId, OrderStatus status);

    OrderResponse cancelOrder(Long orderId, Long accountId);

    OrderResponse confirmReceived(Long orderId, Long accountId);

    PageResponse<OrderResponse> adminListOrders(String q, OrderStatus status, int page, int size);

    AdminOrderStatsResponse adminGetOrderStats();

    OrderResponse adminCancelOrder(Long orderId);
}