package com.sba301.code.be.dto.response;

import com.sba301.code.be.model.enums.ReviewStatus;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class AdminReviewResponse {
    private Long reviewId;
    private Long productId;
    private String productName;
    private Long accountId;
    private String customerName;
    private int rating;
    private String comment;
    private LocalDateTime reviewDate;
    private ReviewStatus status;
    private int helpfulCount;
}

