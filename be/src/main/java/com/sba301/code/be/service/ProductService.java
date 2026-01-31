package com.sba301.code.be.service;


import com.sba301.code.be.dto.request.ProductRequest;
import com.sba301.code.be.dto.response.ProductResponse;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface ProductService {
    public List<ProductResponse> getAllProducts();
    public ProductResponse getProductById(Long productId);
    public ProductResponse createProduct(ProductRequest productRequest);
    public ProductResponse updateProduct(Long productId, ProductRequest productRequest);
    public void deleteProduct(Long productId);
}
