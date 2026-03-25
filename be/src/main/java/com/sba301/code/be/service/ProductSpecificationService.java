package com.sba301.code.be.service;

import com.sba301.code.be.model.entity.ProductSpecification;

import java.util.List;

public interface ProductSpecificationService {

    List<ProductSpecification> findAll();

    ProductSpecification findById(Long id);

    List<ProductSpecification> findByProductId(Long productId);

    ProductSpecification create(Long productId, ProductSpecification spec);

    ProductSpecification update(Long id, ProductSpecification spec);

    void delete(Long id);
}