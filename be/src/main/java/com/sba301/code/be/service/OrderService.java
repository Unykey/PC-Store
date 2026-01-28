package com.sba301.code.be.service;

import com.sba301.code.be.model.entity.Order;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface OrderService {
    public List<Order> getAllOrders();
    public Order getOrderById(int orderId);
    public Order createOrder(Order order);
    public Order updateOrder(int orderId, Order order);
    public void deleteOrder(int orderId);
}
