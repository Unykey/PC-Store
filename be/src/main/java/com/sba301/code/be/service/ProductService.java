package com.sba301.code.be.service;

import com.sba301.code.be.model.entity.Product;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface ProductService {
    public List<Product> getAllProducts();
    public Product getProductById(int productId);
    public Product createProduct(Product product);
    public Product updateProduct(int productId, Product product);
    public void deleteProduct(int productId);
}
