package com.sba301.code.be.repository;

import com.sba301.code.be.model.entity.PaymentTransaction;
import com.sba301.code.be.model.enums.PaymentTransactionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {
    Optional<PaymentTransaction> findByRequestId(String requestId);

    Optional<PaymentTransaction> findByOrderCode(String orderCode);

    boolean existsByOrder_OrderIdAndInstallmentIsNullAndStatus(Long orderId, PaymentTransactionStatus status);
}
