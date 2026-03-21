package com.sba301.code.be.service;

import com.sba301.code.be.dto.response.InstallmentResponse;
import com.sba301.code.be.exception.ResourceNotFoundException;
import com.sba301.code.be.model.entity.Installment;
import com.sba301.code.be.model.entity.PaymentSettings;
import com.sba301.code.be.model.enums.InstallmentStatus;
import com.sba301.code.be.repository.InstallmentRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.scheduling.annotation.Scheduled;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Service
@AllArgsConstructor
public class InstallmentServiceImpl implements InstallmentService {

    private final InstallmentRepository installmentRepository;
    private final PaymentSettingsService paymentSettingsService;

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
        PaymentSettings settings = paymentSettingsService.getOrCreateSettings();
        LocalDate overdueThreshold = LocalDate.now().minusDays(settings.getOverdueGraceDays());

        List<Installment> overdueOnes = installmentRepository
                .findByInstallmentStatusInAndDueDateBefore(
                        List.of(InstallmentStatus.PENDING, InstallmentStatus.OVERDUE),
                        overdueThreshold);

        overdueOnes.forEach(i -> {
            i.setInstallmentStatus(InstallmentStatus.OVERDUE);

            long overdueDays = java.time.temporal.ChronoUnit.DAYS.between(i.getDueDate(), LocalDate.now());
            if (overdueDays > 0) {
                BigDecimal monthsOverdue = BigDecimal.valueOf(overdueDays)
                        .divide(BigDecimal.valueOf(30), 4, RoundingMode.HALF_UP);
                BigDecimal penalty = i.getAmount()
                        .multiply(settings.getMonthlyOverduePenaltyRate())
                        .multiply(monthsOverdue)
                        .setScale(2, RoundingMode.HALF_UP);
                i.setOverdueFee(penalty);
                i.setAmount(i.getPrincipalAmount().add(i.getInterestAmount()).add(penalty));
            }
        });
        installmentRepository.saveAll(overdueOnes);
    }

    @Scheduled(cron = "0 0 0 * * *")
    public void runOverdueJobDaily() {
        markOverdueInstallments();
    }

    private InstallmentResponse mapToResponse(Installment installment) {
        InstallmentResponse response = new InstallmentResponse();
        response.setId(installment.getId());
        response.setOrderId(installment.getOrder().getOrderId());
        response.setProvider(installment.getOrder().getInstallmentProvider());
        response.setTotalMonths(installment.getOrder().getInstallmentMonths());
        response.setMonthNumber(installment.getMonthNumber());
        response.setAmount(installment.getAmount());
        response.setPrincipalAmount(installment.getPrincipalAmount());
        response.setInterestAmount(installment.getInterestAmount());
        response.setOverdueFee(installment.getOverdueFee());
        response.setDueDate(installment.getDueDate());
        response.setPaidDate(installment.getPaidDate());
        response.setInstallmentStatus(installment.getInstallmentStatus());
        return response;
    }
}
