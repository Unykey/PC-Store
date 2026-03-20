package com.sba301.code.be.service;

import com.sba301.code.be.dto.response.InstallmentResponse;

import java.util.List;

public interface InstallmentService {

    /** Get all installment schedule entries for a given order */
    List<InstallmentResponse> getByOrderId(Long orderId);

    /** Get all installments belonging to a specific account (across all orders) */
    List<InstallmentResponse> getByAccountId(Long accountId);

    /** Mark a single installment entry as PAID */
    InstallmentResponse markAsPaid(Long installmentId);

    /** Refresh overdue status for all pending installments past their due date */
    void markOverdueInstallments();
}
