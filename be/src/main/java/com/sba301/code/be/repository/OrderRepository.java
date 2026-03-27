package com.sba301.code.be.repository;

import com.sba301.code.be.model.entity.Order;
import com.sba301.code.be.model.enums.OrderStatus;
import com.sba301.code.be.model.enums.PaymentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long>, JpaSpecificationExecutor<Order> {
    List<Order> findByAccount_AccountId(Long accountId);

    List<Order> findByPaymentType(PaymentType paymentType);

    long countByOrderStatus(OrderStatus status);
}