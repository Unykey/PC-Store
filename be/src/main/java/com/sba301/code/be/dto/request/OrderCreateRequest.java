package com.sba301.code.be.dto.request;

import com.sba301.code.be.model.enums.InstallmentProvider;
import com.sba301.code.be.model.enums.PaymentType;
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

    /** FULL_PAYMENT (default) or INSTALLMENT */
    private PaymentType paymentType = PaymentType.FULL_PAYMENT;

    /** Required when paymentType = INSTALLMENT. Allowed values: 3, 6, 12, 24 */
    private Integer installmentMonths;

    /** Required when paymentType = INSTALLMENT */
    private InstallmentProvider installmentProvider;
}
