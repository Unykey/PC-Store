package com.sba301.code.be.dto.request;


import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class OrderCreateRequest {
    private Long accountId;
    private String shippingAddress;
    private String note;
    private List<OrderItemRequest> items;
}
