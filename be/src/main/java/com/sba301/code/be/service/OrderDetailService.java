package com.sba301.code.be.service;

import com.sba301.code.be.entity.OrderDetail;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface OrderDetailService {
    public List<OrderDetail> getAllOrderDetails();
    public OrderDetail getOrderDetailById(int orderDetailId);
    public OrderDetail createOrderDetail(OrderDetail orderDetail);
    public OrderDetail updateOrderDetail(int orderDetailId, OrderDetail orderDetail);
    public void deleteOrderDetail(int orderDetailId);
}
