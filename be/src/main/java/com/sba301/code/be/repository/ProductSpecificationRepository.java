package com.sba301.code.be.repository;

import com.sba301.code.be.model.entity.ProductSpecification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductSpecificationRepository extends JpaRepository<ProductSpecification, Long> {
    List<ProductSpecification> findByProduct_ProductId(Long productId);
}
