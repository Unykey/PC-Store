package com.sba301.code.be.service;

import com.sba301.code.be.dto.request.ProductSpecificationRequest;
import com.sba301.code.be.dto.response.ProductSpecificationResponse;
import com.sba301.code.be.model.entity.Product;
import com.sba301.code.be.model.entity.ProductSpecification;
import com.sba301.code.be.repository.ProductRepository;
import com.sba301.code.be.repository.ProductSpecificationRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class ProductSpecificationServiceImpl implements ProductSpecificationService {

    private final ProductSpecificationRepository specRepository;
    private final ProductRepository productRepository;

    private ProductSpecificationResponse toResponse(ProductSpecification spec) {
        ProductSpecificationResponse res = new ProductSpecificationResponse();
        res.setProductSpecificationId(spec.getProductSpecificationId());
        res.setSpecKey(spec.getSpecKey());
        res.setSpecValue(spec.getSpecValue());
        res.setProductId(spec.getProduct().getProductId());
        return res;
    }

    @Override
    public List<ProductSpecificationResponse> getAll() {
        return specRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ProductSpecificationResponse getById(Long id) {
        ProductSpecification spec = specRepository.findById(id).orElse(null);
        return spec == null ? null : toResponse(spec);
    }

    @Override
    public List<ProductSpecificationResponse> getByProductId(Long productId) {
        return specRepository.findByProduct_ProductId(productId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ProductSpecificationResponse create(ProductSpecificationRequest request) {
        Product product = productRepository.findById(request.getProductId()).orElse(null);
        if (product == null) return null;

        ProductSpecification spec = new ProductSpecification();
        spec.setSpecKey(request.getSpecKey());
        spec.setSpecValue(request.getSpecValue());
        spec.setProduct(product);

        return toResponse(specRepository.save(spec));
    }

    @Override
    public ProductSpecificationResponse update(Long id, ProductSpecificationRequest request) {
        ProductSpecification old = specRepository.findById(id).orElse(null);
        if (old == null) return null;

        old.setSpecKey(request.getSpecKey());
        old.setSpecValue(request.getSpecValue());

        return toResponse(specRepository.save(old));
    }

    @Override
    public void delete(Long id) {
        specRepository.deleteById(id);
    }
}