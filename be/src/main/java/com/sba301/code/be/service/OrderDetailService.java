package com.sba301.code.be.service;

import com.sba301.code.be.model.entity.OrderDetail;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface OrderDetailService {
    List<OrderDetail> getDetailsByOrderId(Long orderId);
}
