package com.sba301.code.be.repository;

import com.sba301.code.be.model.entity.Review;
import com.sba301.code.be.model.enums.ReviewStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    long countByStatus(ReviewStatus status);
}

