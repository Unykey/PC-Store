package com.sba301.code.be.service;



import com.sba301.code.be.dto.request.ProductRequest;
import com.sba301.code.be.dto.response.ProductResponse;
import com.sba301.code.be.exception.ResourceNotFoundException;
import com.sba301.code.be.model.entity.Category;
import com.sba301.code.be.model.entity.Product;
import com.sba301.code.be.repository.CategoryRepository;
import com.sba301.code.be.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductServiceImpl implements ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Override
    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ProductResponse getProductById(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id " + productId));
        return toResponse(product);
    }

    @Override
    public ProductResponse createProduct(ProductRequest productRequest) {
        Product product = new Product();
        applyRequestToEntity(productRequest, product);
        Product saved = productRepository.save(product);
        return toResponse(saved);
    }

    @Override
    public ProductResponse updateProduct(Long productId, ProductRequest productRequest) {
        Product existing = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id " + productId));
        applyRequestToEntity(productRequest, existing);
        existing.setProductId(productId);
        Product saved = productRepository.save(existing);
        return toResponse(saved);
    }

    @Override
    public void deleteProduct(Long productId) {
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Product not found with id " + productId);
        }
        productRepository.deleteById(productId);
    }

    private ProductResponse toResponse(Product product) {
        ProductResponse res = new ProductResponse();
        res.setProductId(product.getProductId());
        res.setName(product.getName());
        res.setDescription(product.getDescription());
        res.setPrice(product.getPrice());
        res.setStockQuantity(product.getStockQuantity());
        res.setSerialNumber(product.getSerialNumber());
        if (product.getCategory() != null) {
            res.setCategoryId(product.getCategory().getCategoryId());
            res.setCategoryName(product.getCategory().getName());
        }
        return res;
    }

    private void applyRequestToEntity(ProductRequest req, Product entity) {
        entity.setName(req.getName());
        entity.setDescription(req.getDescription());
        entity.setPrice(req.getPrice());
        entity.setStockQuantity(req.getStockQuantity());
        entity.setSerialNumber(req.getSerialNumber());
        if (req.getCategoryId() != null) {
            Category category = categoryRepository.findById(req.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found with id " + req.getCategoryId()));
            entity.setCategory(category);
        } else {
            entity.setCategory(null);
        }
    }
}