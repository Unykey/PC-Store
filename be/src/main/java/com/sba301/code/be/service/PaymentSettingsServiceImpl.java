package com.sba301.code.be.service;

import com.sba301.code.be.dto.request.PaymentSettingsUpdateRequest;
import com.sba301.code.be.dto.response.PaymentSettingsResponse;
import com.sba301.code.be.model.entity.PaymentSettings;
import com.sba301.code.be.repository.PaymentSettingsRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@AllArgsConstructor
public class PaymentSettingsServiceImpl implements PaymentSettingsService {

    private final PaymentSettingsRepository paymentSettingsRepository;

    @Override
    @Transactional
    public PaymentSettings getOrCreateSettings() {
        return paymentSettingsRepository.findById(1L)
                .orElseGet(() -> paymentSettingsRepository.save(new PaymentSettings()));
    }

    @Override
    public PaymentSettingsResponse getSettings() {
        return mapToResponse(getOrCreateSettings());
    }

    @Override
    @Transactional
    public PaymentSettingsResponse updateSettings(PaymentSettingsUpdateRequest request) {
        PaymentSettings settings = getOrCreateSettings();

        if (request.getMonthlyInstallmentRate() != null) {
            validateRate(request.getMonthlyInstallmentRate(), "monthlyInstallmentRate");
            settings.setMonthlyInstallmentRate(request.getMonthlyInstallmentRate());
        }

        if (request.getMonthlyOverduePenaltyRate() != null) {
            validateRate(request.getMonthlyOverduePenaltyRate(), "monthlyOverduePenaltyRate");
            settings.setMonthlyOverduePenaltyRate(request.getMonthlyOverduePenaltyRate());
        }

        if (request.getOverdueGraceDays() != null) {
            if (request.getOverdueGraceDays() < 0 || request.getOverdueGraceDays() > 30) {
                throw new IllegalArgumentException("overdueGraceDays must be between 0 and 30");
            }
            settings.setOverdueGraceDays(request.getOverdueGraceDays());
        }

        settings.setUpdatedAt(LocalDateTime.now());
        return mapToResponse(paymentSettingsRepository.save(settings));
    }

    private void validateRate(BigDecimal rate, String field) {
        if (rate.compareTo(BigDecimal.ZERO) < 0 || rate.compareTo(new BigDecimal("1")) >= 0) {
            throw new IllegalArgumentException(field + " must be >= 0 and < 1");
        }
    }

    private PaymentSettingsResponse mapToResponse(PaymentSettings settings) {
        PaymentSettingsResponse response = new PaymentSettingsResponse();
        response.setMonthlyInstallmentRate(settings.getMonthlyInstallmentRate());
        response.setMonthlyOverduePenaltyRate(settings.getMonthlyOverduePenaltyRate());
        response.setOverdueGraceDays(settings.getOverdueGraceDays());
        response.setUpdatedAt(settings.getUpdatedAt());
        return response;
    }
}
