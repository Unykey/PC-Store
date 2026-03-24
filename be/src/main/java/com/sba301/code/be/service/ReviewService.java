package com.sba301.code.be.service;

import com.sba301.code.be.dto.response.AdminReviewResponse;
import com.sba301.code.be.model.enums.ReviewStatus;

import java.util.List;

public interface ReviewService {
    List<AdminReviewResponse> adminList(String q, ReviewStatus status);

    AdminReviewResponse adminUpdateStatus(Long id, ReviewStatus status);

    void adminDelete(Long id);
}

