package com.sba301.code.be.service;

import com.sba301.code.be.dto.request.PaymentSettingsUpdateRequest;
import com.sba301.code.be.dto.response.PaymentSettingsResponse;
import com.sba301.code.be.model.entity.PaymentSettings;

public interface PaymentSettingsService {
    PaymentSettings getOrCreateSettings();

    PaymentSettingsResponse getSettings();

    PaymentSettingsResponse updateSettings(PaymentSettingsUpdateRequest request);
}
