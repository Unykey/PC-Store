package com.sba301.code.be.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CustomerDetailResponse {
    private Long accountId;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String address;
    private List<Long> orderIds;
    private int ordersCount;
    private BigDecimal totalSpent;
    private LocalDateTime joinDate;
    private String status;
}

