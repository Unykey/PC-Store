package com.sba301.code.be.repository;

import com.sba301.code.be.model.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    // Find products with stock less than or equal to the given threshold
    List<Product> findByStockQuantityLessThanEqual(int threshold);
}
