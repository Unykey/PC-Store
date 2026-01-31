package com.sba301.code.be.dto.response;

import com.sba301.code.be.model.enums.OrderStatus;
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
    private List<OrderDetailResponse> orderDetails;
}
