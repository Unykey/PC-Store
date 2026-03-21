package com.sba301.code.be.dto.response;

import com.sba301.code.be.model.enums.InstallmentProvider;
import com.sba301.code.be.model.enums.OrderStatus;
import com.sba301.code.be.model.enums.PaymentType;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class OrderResponse {
    private Long orderId;
    private LocalDateTime orderDate;
    private OrderStatus orderStatus;
    private BigDecimal totalAmount;
    private Long accountId;
    private String accountName;
    private String shippingAddress;
    private String note;
    private List<OrderDetailResponse> orderDetails;

    // Installment summary (populated only when paymentType = INSTALLMENT)
    private PaymentType paymentType;
    private Integer installmentMonths;
    private InstallmentProvider installmentProvider;
    private BigDecimal monthlyAmount;
    private List<InstallmentResponse> installments;
}
