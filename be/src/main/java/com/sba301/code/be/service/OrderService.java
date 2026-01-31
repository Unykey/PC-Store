package com.sba301.code.be.service;

import com.sba301.code.be.dto.request.OrderCreateRequest;
import com.sba301.code.be.dto.response.OrderResponse;
import com.sba301.code.be.model.entity.Order;
import com.sba301.code.be.model.enums.OrderStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface OrderService {
    List<Order> getAllOrders();
    OrderResponse getOrderById(Long orderId);
    List<OrderResponse> getOrdersByAccountId(Long accountId);
    OrderResponse placeOrder(OrderCreateRequest request);
    OrderResponse updateOrderStatus(Long orderId, OrderStatus status);
    void deleteOrder(Long orderId);
}