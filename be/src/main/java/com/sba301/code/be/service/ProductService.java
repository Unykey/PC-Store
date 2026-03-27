package com.sba301.code.be.service;


import com.sba301.code.be.dto.request.ProductRequest;
import com.sba301.code.be.dto.response.ProductResponse;
import com.sba301.code.be.dto.response.ProductPageResponse;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface ProductService {
    List<ProductResponse> getAllProducts();
    ProductResponse getProductById(Long productId);
    ProductResponse createProduct(ProductRequest productRequest);
    ProductResponse updateProduct(Long productId, ProductRequest productRequest);
    void deleteProduct(Long productId);

    // New: filtered and paginated product listing for admin
    ProductPageResponse getProducts(String search, Long categoryId, Integer minStock, Integer maxStock,
                                      int page, int size, String sort);

    // New: return products considered low stock (stock < 10)
    List<ProductResponse> getLowStockProducts();

    List<ProductResponse> getProductsPaging(int page, int size);
}
