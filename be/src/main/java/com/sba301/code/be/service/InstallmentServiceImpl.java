package com.sba301.code.be.service;

import com.sba301.code.be.dto.response.InstallmentResponse;
import com.sba301.code.be.dto.response.AdminInstallmentPaymentResponse;
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
import java.util.Comparator;

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

    @Override
    public List<AdminInstallmentPaymentResponse> getPaidInstallments(Integer month, Integer year) {
        List<Installment> paid = installmentRepository.findByInstallmentStatus(InstallmentStatus.PAID);

        return paid.stream()
                .filter(i -> i.getPaidDate() != null)
                .filter(i -> month == null || i.getPaidDate().getMonthValue() == month)
                .filter(i -> year == null || i.getPaidDate().getYear() == year)
                .sorted(Comparator.comparing(Installment::getPaidDate).reversed())
                .map(this::mapToAdminPaymentResponse)
                .toList();
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

    private AdminInstallmentPaymentResponse mapToAdminPaymentResponse(Installment installment) {
        AdminInstallmentPaymentResponse response = new AdminInstallmentPaymentResponse();
        response.setInstallmentId(installment.getId());
        response.setOrderId(installment.getOrder().getOrderId());
        response.setMonthNumber(installment.getMonthNumber());
        response.setTotalMonths(installment.getOrder().getInstallmentMonths());
        response.setAmount(installment.getAmount());
        response.setPrincipalAmount(installment.getPrincipalAmount());
        response.setInterestAmount(installment.getInterestAmount());
        response.setOverdueFee(installment.getOverdueFee());
        response.setDueDate(installment.getDueDate());
        response.setPaidDate(installment.getPaidDate());

        if (installment.getOrder().getAccount() != null) {
            response.setAccountId(installment.getOrder().getAccount().getAccountId());
            response.setCustomerName(installment.getOrder().getAccount().getFullName());
            response.setCustomerEmail(installment.getOrder().getAccount().getEmail());
            response.setCustomerPhone(installment.getOrder().getAccount().getPhoneNumber());
        }

        return response;
    }
}
