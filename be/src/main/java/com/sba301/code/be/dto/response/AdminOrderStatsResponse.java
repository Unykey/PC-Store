package com.sba301.code.be.dto.response;

import com.sba301.code.be.model.enums.OrderStatus;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.EnumMap;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
public class AdminOrderStatsResponse {
    private long total;
    private Map<OrderStatus, Long> byStatus = new EnumMap<>(OrderStatus.class);
}

