package com.sba301.code.be.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CustomerListResponse {
    private Long accountId;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String address;
    private int ordersCount;
    private BigDecimal totalSpent;
    private LocalDateTime joinDate; // nullable; may be null if not tracked
    private String status; // e.g., "Active"
}

