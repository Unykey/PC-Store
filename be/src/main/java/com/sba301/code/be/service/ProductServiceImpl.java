package com.sba301.code.be.service;


import com.sba301.code.be.dto.request.ProductRequest;
import com.sba301.code.be.dto.response.ProductPageResponse;
import com.sba301.code.be.dto.response.ProductResponse;
import com.sba301.code.be.exception.ResourceNotFoundException;
import com.sba301.code.be.model.entity.Category;
import com.sba301.code.be.model.entity.Product;
import com.sba301.code.be.repository.CategoryRepository;
import com.sba301.code.be.repository.ProductRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@AllArgsConstructor
public class ProductServiceImpl implements ProductService {
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

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

    @Override
    public ProductPageResponse getProducts(String search, Long categoryId, Integer minStock, Integer maxStock,
                                             int page, int size, String sort) {
        List<Product> all = productRepository.findAll();
        Stream<Product> stream = all.stream();

        if (search != null && !search.isBlank()) {
            String s = search.trim().toLowerCase();
            stream = stream.filter(p -> (p.getName() != null && p.getName().toLowerCase().contains(s))
                    || (p.getSerialNumber() != null && p.getSerialNumber().toLowerCase().contains(s)));
        }

        if (categoryId != null) {
            stream = stream.filter(p -> p.getCategory() != null && p.getCategory().getCategoryId().equals(categoryId));
        }

        if (minStock != null) {
            stream = stream.filter(p -> p.getStockQuantity() >= minStock);
        }

        if (maxStock != null) {
            stream = stream.filter(p -> p.getStockQuantity() <= maxStock);
        }

        // Collect filtered list for total count before pagination
        List<Product> filtered = stream.collect(Collectors.toList());
        long total = filtered.size();

        // Sorting and pagination on the filtered list
        Stream<Product> pageStream = filtered.stream();
        if ("price".equalsIgnoreCase(sort)) {
            pageStream = pageStream.sorted((a, b) -> b.getPrice().compareTo(a.getPrice()));
        } else if ("stock".equalsIgnoreCase(sort)) {
            pageStream = pageStream.sorted((a, b) -> Integer.compare(b.getStockQuantity(), a.getStockQuantity()));
        } else {
            // default: by name
            pageStream = pageStream.sorted((a, b) -> a.getName().compareToIgnoreCase(b.getName()));
        }

        List<ProductResponse> items = pageStream
                .skip((long) page * size)
                .limit(size)
                .map(this::toResponse)
                .collect(Collectors.toList());

        return new ProductPageResponse(items, total);
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