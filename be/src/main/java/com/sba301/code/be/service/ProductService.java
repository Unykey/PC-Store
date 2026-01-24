package com.sba301.code.be.service;

import com.sba301.code.be.entity.Product;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface ProductService {
    Product createProduct(Product product);

    Product getProductById(Long productId);

    Product updateProduct(Long productId, Product productDetails);

    void deleteProduct(Long productId);

    List<Product> getAllProducts();


}
