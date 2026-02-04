package com.sba301.code.be.service;

import com.sba301.code.be.model.entity.OrderDetail;
import com.sba301.code.be.repository.OrderDetailRepository;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@AllArgsConstructor
public class OrderDetailServiceImpl implements OrderDetailService {
    private final OrderDetailRepository orderDetailRepository;

    @Override
    public List<OrderDetail> getDetailsByOrderId(Long orderId) {
        return orderDetailRepository.findByOrder_OrderId(orderId);
    }
}
