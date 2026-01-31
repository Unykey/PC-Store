package com.sba301.code.be.service;

import com.sba301.code.be.model.entity.Order;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface OrderService {
    public List<Order> getAllOrders();
    public Order getOrderById(Long orderId);
    public Order createOrder(Order order);
    public Order updateOrder(Long orderId, Order order);
    public void deleteOrder(Long orderId);
}
