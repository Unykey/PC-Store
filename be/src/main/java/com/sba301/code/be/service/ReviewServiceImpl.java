package com.sba301.code.be.service;

import com.sba301.code.be.dto.response.AdminReviewResponse;
import com.sba301.code.be.exception.ResourceNotFoundException;
import com.sba301.code.be.model.entity.Review;
import com.sba301.code.be.model.enums.ReviewStatus;
import com.sba301.code.be.repository.ReviewRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;

@Service
@AllArgsConstructor
public class ReviewServiceImpl implements ReviewService {
    private final ReviewRepository reviewRepository;

    @Override
    public List<AdminReviewResponse> adminList(String q, ReviewStatus status) {
        String query = q == null ? "" : q.trim().toLowerCase(Locale.ROOT);
        return reviewRepository.findAll().stream()
                .filter(r -> status == null || r.getStatus() == status)
                .filter(r -> {
                    if (query.isEmpty()) return true;
                    String productName = r.getProduct() != null && r.getProduct().getName() != null ? r.getProduct().getName().toLowerCase(Locale.ROOT) : "";
                    String customerName = r.getAccount() != null && r.getAccount().getFullName() != null ? r.getAccount().getFullName().toLowerCase(Locale.ROOT) : "";
                    String comment = r.getComment() != null ? r.getComment().toLowerCase(Locale.ROOT) : "";
                    return productName.contains(query) || customerName.contains(query) || comment.contains(query);
                })
                .map(this::toResponse)
                .toList();
    }

    @Override
    public AdminReviewResponse adminUpdateStatus(Long id, ReviewStatus status) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with id " + id));
        review.setStatus(status);
        return toResponse(reviewRepository.save(review));
    }

    @Override
    public void adminDelete(Long id) {
        if (!reviewRepository.existsById(id)) {
            throw new ResourceNotFoundException("Review not found with id " + id);
        }
        reviewRepository.deleteById(id);
    }

    private AdminReviewResponse toResponse(Review review) {
        AdminReviewResponse r = new AdminReviewResponse();
        r.setReviewId(review.getReviewId());
        if (review.getProduct() != null) {
            r.setProductId(review.getProduct().getProductId());
            r.setProductName(review.getProduct().getName());
        }
        if (review.getAccount() != null) {
            r.setAccountId(review.getAccount().getAccountId());
            r.setCustomerName(review.getAccount().getFullName());
        }
        r.setRating(review.getRating());
        r.setComment(review.getComment());
        r.setReviewDate(review.getReviewDate());
        r.setStatus(review.getStatus());
        r.setHelpfulCount(review.getHelpfulCount());
        return r;
    }
}

