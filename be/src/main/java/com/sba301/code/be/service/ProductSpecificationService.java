package com.sba301.code.be.service;

import com.sba301.code.be.dto.request.ProductSpecificationRequest;
import com.sba301.code.be.dto.response.ProductSpecificationResponse;

import java.util.List;

public interface ProductSpecificationService {

    List<ProductSpecificationResponse> getAll();
    ProductSpecificationResponse getById(Long id);
    List<ProductSpecificationResponse> getByProductId(Long productId);
    ProductSpecificationResponse create(ProductSpecificationRequest request);
    ProductSpecificationResponse update(Long id, ProductSpecificationRequest request);
    void delete(Long id);
}