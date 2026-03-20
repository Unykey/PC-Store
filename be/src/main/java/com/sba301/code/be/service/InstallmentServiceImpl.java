package com.sba301.code.be.service;

import com.sba301.code.be.dto.response.InstallmentResponse;
import com.sba301.code.be.exception.ResourceNotFoundException;
import com.sba301.code.be.model.entity.Installment;
import com.sba301.code.be.model.enums.InstallmentStatus;
import com.sba301.code.be.repository.InstallmentRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@AllArgsConstructor
public class InstallmentServiceImpl implements InstallmentService {

    private final InstallmentRepository installmentRepository;

    @Override
    public List<InstallmentResponse> getByOrderId(Long orderId) {
        return installmentRepository.findByOrder_OrderId(orderId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<InstallmentResponse> getByAccountId(Long accountId) {
        return installmentRepository.findByOrder_Account_AccountId(accountId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional
    public InstallmentResponse markAsPaid(Long installmentId) {
        Installment installment = installmentRepository.findById(installmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Installment not found with ID: " + installmentId));

        if (installment.getInstallmentStatus() == InstallmentStatus.PAID) {
            throw new IllegalStateException("Installment #" + installmentId + " is already paid.");
        }

        installment.setInstallmentStatus(InstallmentStatus.PAID);
        installment.setPaidDate(LocalDate.now());
        return mapToResponse(installmentRepository.save(installment));
    }

    @Override
    @Transactional
    public void markOverdueInstallments() {
        List<Installment> overdueOnes = installmentRepository
                .findByInstallmentStatusAndDueDateBefore(InstallmentStatus.PENDING, LocalDate.now());
        overdueOnes.forEach(i -> i.setInstallmentStatus(InstallmentStatus.OVERDUE));
        installmentRepository.saveAll(overdueOnes);
    }

    private InstallmentResponse mapToResponse(Installment installment) {
        InstallmentResponse response = new InstallmentResponse();
        response.setId(installment.getId());
        response.setOrderId(installment.getOrder().getOrderId());
        response.setProvider(installment.getOrder().getInstallmentProvider());
        response.setTotalMonths(installment.getOrder().getInstallmentMonths());
        response.setMonthNumber(installment.getMonthNumber());
        response.setAmount(installment.getAmount());
        response.setDueDate(installment.getDueDate());
        response.setPaidDate(installment.getPaidDate());
        response.setInstallmentStatus(installment.getInstallmentStatus());
        return response;
    }
}
