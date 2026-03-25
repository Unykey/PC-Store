package com.sba301.code.be.service;

import com.sba301.code.be.model.entity.Product;
import com.sba301.code.be.model.entity.ProductSpecification;
import com.sba301.code.be.repository.ProductRepository;
import com.sba301.code.be.repository.ProductSpecificationRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class ProductSpecificationServiceImpl implements ProductSpecificationService {

    private final ProductSpecificationRepository specRepository;
    private final ProductRepository productRepository;

    @Override
    public List<ProductSpecification> findAll() {
        return specRepository.findAll();
    }

    @Override
    public ProductSpecification findById(Long id) {
        return specRepository.findById(id).orElse(null);
    }

    @Override
    public List<ProductSpecification> findByProductId(Long productId) {
        return specRepository.findByProduct_ProductId(productId);
    }

    @Override
    public ProductSpecification create(Long productId, ProductSpecification spec) {
        Product product = productRepository.findById(productId).orElse(null);
        if (product == null) return null;

        spec.setProduct(product);
        return specRepository.save(spec);
    }

    @Override
    public ProductSpecification update(Long id, ProductSpecification newSpec) {
        ProductSpecification old = findById(id);
        if (old == null) return null;

        old.setSpecKey(newSpec.getSpecKey());
        old.setSpecValue(newSpec.getSpecValue());

        return specRepository.save(old);
    }

    @Override
    public void delete(Long id) {
        specRepository.deleteById(id);
    }
}
