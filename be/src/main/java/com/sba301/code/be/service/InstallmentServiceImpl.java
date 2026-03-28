package com.sba301.code.be.service;

import com.sba301.code.be.dto.response.InstallmentResponse;
import com.sba301.code.be.dto.response.AdminInstallmentPaymentResponse;
import com.sba301.code.be.dto.response.AdminInstallmentMonitoringSummaryResponse;
import com.sba301.code.be.dto.response.AdminInstallmentContractResponse;
import com.sba301.code.be.exception.ResourceNotFoundException;
import com.sba301.code.be.model.entity.Installment;
import com.sba301.code.be.model.entity.Order;
import com.sba301.code.be.model.entity.PaymentSettings;
import com.sba301.code.be.model.enums.InstallmentStatus;
import com.sba301.code.be.model.enums.OrderStatus;
import com.sba301.code.be.model.enums.PaymentType;
import com.sba301.code.be.repository.InstallmentRepository;
import com.sba301.code.be.repository.OrderRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.scheduling.annotation.Scheduled;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Comparator;
import java.util.Locale;
import java.util.Objects;
import java.util.Optional;

@Service
@AllArgsConstructor
public class InstallmentServiceImpl implements InstallmentService {

    private final InstallmentRepository installmentRepository;
    private final OrderRepository orderRepository;
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

    @Override
    public AdminInstallmentMonitoringSummaryResponse getAdminMonitoringSummary(Integer month, Integer year) {
        int safeMonth = month == null ? LocalDate.now().getMonthValue() : Math.max(1, Math.min(12, month));
        int safeYear = year == null ? LocalDate.now().getYear() : year;

        List<Order> installmentOrders = orderRepository.findByPaymentType(PaymentType.INSTALLMENT);
        List<AdminInstallmentContractResponse> contracts = installmentOrders.stream()
                .map(this::toAdminContractRow)
                .toList();

        AdminInstallmentMonitoringSummaryResponse summary = new AdminInstallmentMonitoringSummaryResponse();
        summary.setTotalContracts(contracts.size());
        summary.setActiveContracts(contracts.stream().filter(c -> c.getOrderStatus() != OrderStatus.CANCELLED
                && c.getOrderStatus() != OrderStatus.COMPLETED
                && c.getOrderStatus() != OrderStatus.DEFAULTED).count());
        summary.setOverdueContracts(
                contracts.stream().filter(c -> c.getOverdueMonths() != null && c.getOverdueMonths() > 0).count());
        summary.setDefaultedContracts(
                contracts.stream().filter(c -> c.getOrderStatus() == OrderStatus.DEFAULTED).count());

        BigDecimal totalOutstanding = contracts.stream()
                .map(AdminInstallmentContractResponse::getRemainingAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        summary.setTotalOutstanding(totalOutstanding);

        BigDecimal overdueOutstanding = installmentOrders.stream()
                .flatMap(o -> Optional.ofNullable(o.getInstallments()).orElseGet(java.util.Collections::emptySet)
                        .stream())
                .filter(i -> i.getInstallmentStatus() == InstallmentStatus.OVERDUE)
                .map(Installment::getAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        summary.setOverdueOutstanding(overdueOutstanding);

        BigDecimal collectedThisMonth = installmentOrders.stream()
                .flatMap(o -> Optional.ofNullable(o.getInstallments()).orElseGet(java.util.Collections::emptySet)
                        .stream())
                .filter(i -> i.getInstallmentStatus() == InstallmentStatus.PAID && i.getPaidDate() != null)
                .filter(i -> i.getPaidDate().getMonthValue() == safeMonth && i.getPaidDate().getYear() == safeYear)
                .map(Installment::getAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        summary.setCollectedThisMonth(collectedThisMonth);

        BigDecimal paidAmount = contracts.stream()
                .map(AdminInstallmentContractResponse::getPaidAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal denominator = paidAmount.add(totalOutstanding);
        if (denominator.compareTo(BigDecimal.ZERO) > 0) {
            summary.setCollectionRate(
                    paidAmount.multiply(BigDecimal.valueOf(100)).divide(denominator, 2, RoundingMode.HALF_UP));
        }

        return summary;
    }

    @Override
    public List<AdminInstallmentContractResponse> getAdminInstallmentContracts(String q, String contractState) {
        String keyword = q == null ? "" : q.trim().toLowerCase(Locale.ROOT);
        String state = contractState == null ? "ALL" : contractState.trim().toUpperCase(Locale.ROOT);

        return orderRepository.findByPaymentType(PaymentType.INSTALLMENT).stream()
                .map(this::toAdminContractRow)
                .filter(c -> {
                    if (keyword.isEmpty())
                        return true;
                    return String.valueOf(c.getOrderId()).contains(keyword)
                            || (c.getCustomerName() != null
                                    && c.getCustomerName().toLowerCase(Locale.ROOT).contains(keyword))
                            || (c.getCustomerEmail() != null
                                    && c.getCustomerEmail().toLowerCase(Locale.ROOT).contains(keyword))
                            || (c.getCustomerPhone() != null
                                    && c.getCustomerPhone().toLowerCase(Locale.ROOT).contains(keyword));
                })
                .filter(c -> filterByContractState(c, state))
                .sorted((a, b) -> {
                    if (a.getOrderStatus() == OrderStatus.DEFAULTED && b.getOrderStatus() != OrderStatus.DEFAULTED)
                        return -1;
                    if (a.getOrderStatus() != OrderStatus.DEFAULTED && b.getOrderStatus() == OrderStatus.DEFAULTED)
                        return 1;
                    return Long.compare(b.getOrderId(), a.getOrderId());
                })
                .toList();
    }

    private boolean filterByContractState(AdminInstallmentContractResponse c, String state) {
        return switch (state) {
            case "DEFAULTED" -> c.getOrderStatus() == OrderStatus.DEFAULTED;
            case "OVERDUE" -> c.getOverdueMonths() != null && c.getOverdueMonths() > 0;
            case "ACTIVE" -> c.getOrderStatus() != OrderStatus.DEFAULTED
                    && c.getOrderStatus() != OrderStatus.CANCELLED
                    && c.getOrderStatus() != OrderStatus.COMPLETED
                    && (c.getRemainingAmount() == null || c.getRemainingAmount().compareTo(BigDecimal.ZERO) > 0);
            case "CLOSED" -> c.getOrderStatus() == OrderStatus.COMPLETED
                    || (c.getRemainingAmount() != null && c.getRemainingAmount().compareTo(BigDecimal.ZERO) <= 0);
            default -> true;
        };
    }

    private AdminInstallmentContractResponse toAdminContractRow(Order order) {
        AdminInstallmentContractResponse response = new AdminInstallmentContractResponse();
        response.setOrderId(order.getOrderId());
        response.setOrderStatus(order.getOrderStatus());
        response.setTotalAmount(order.getTotalAmount() == null ? BigDecimal.ZERO : order.getTotalAmount());
        response.setTotalMonths(order.getInstallmentMonths());

        if (order.getAccount() != null) {
            response.setAccountId(order.getAccount().getAccountId());
            response.setCustomerName(order.getAccount().getFullName());
            response.setCustomerEmail(order.getAccount().getEmail());
            response.setCustomerPhone(order.getAccount().getPhoneNumber());
        }

        List<Installment> allInstallments = Optional.ofNullable(order.getInstallments())
                .orElseGet(java.util.Collections::emptySet)
                .stream()
                .sorted(Comparator.comparingInt(Installment::getMonthNumber))
                .toList();

        int paidMonths = (int) allInstallments.stream().filter(i -> i.getInstallmentStatus() == InstallmentStatus.PAID)
                .count();
        int overdueMonths = (int) allInstallments.stream()
                .filter(i -> i.getInstallmentStatus() == InstallmentStatus.OVERDUE).count();
        response.setPaidMonths(paidMonths);
        response.setOverdueMonths(overdueMonths);

        BigDecimal paidAmount = allInstallments.stream()
                .filter(i -> i.getInstallmentStatus() == InstallmentStatus.PAID)
                .map(Installment::getAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        response.setPaidAmount(paidAmount);

        BigDecimal remainingAmount = allInstallments.stream()
                .filter(i -> i.getInstallmentStatus() != InstallmentStatus.PAID)
                .map(Installment::getAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        response.setRemainingAmount(remainingAmount);

        allInstallments.stream()
                .filter(i -> i.getInstallmentStatus() != InstallmentStatus.PAID)
                .min(Comparator.comparing(Installment::getDueDate))
                .ifPresent(next -> {
                    response.setNextDueDate(next.getDueDate());
                    response.setNextDueAmount(next.getAmount());
                });

        allInstallments.stream()
                .filter(i -> i.getPaidDate() != null)
                .map(Installment::getPaidDate)
                .max(LocalDate::compareTo)
                .ifPresent(response::setLastPaidDate);

        String riskLevel;
        if (order.getOrderStatus() == OrderStatus.DEFAULTED) {
            riskLevel = "HIGH";
        } else if (overdueMonths >= 2) {
            riskLevel = "HIGH";
        } else if (overdueMonths == 1) {
            riskLevel = "MEDIUM";
        } else {
            riskLevel = "LOW";
        }
        response.setRiskLevel(riskLevel);
        return response;
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
