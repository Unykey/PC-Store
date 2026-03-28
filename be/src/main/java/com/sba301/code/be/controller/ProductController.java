package com.sba301.code.be.controller;

import com.sba301.code.be.dto.request.ProductRequest;
import com.sba301.code.be.dto.response.ApiResponse;
import com.sba301.code.be.dto.response.ProductResponse;
import com.sba301.code.be.service.ProductService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@AllArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getAllProducts() {
        List<ProductResponse> products = productService.getAllProducts();
        return ResponseEntity.ok(ApiResponse.success(products, "Get all products successfully"));
    }

    @GetMapping("paging")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getProductsPaging(@RequestParam(defaultValue = "0") int page,
                                                                                @RequestParam(defaultValue = "4") int size) {
        List<ProductResponse> products = productService.getProductsPaging(page, size);
        return ResponseEntity.ok(ApiResponse.success(products, "Get products paging successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductById(@PathVariable("id") Long id) {
        ProductResponse product = productService.getProductById(id);
        return ResponseEntity.ok(ApiResponse.success(product, "Get product successfully"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(@RequestBody ProductRequest request) {
        ProductResponse created = productService.createProduct(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(created, "Product created successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> updateProduct(@PathVariable("id") Long id, @RequestBody ProductRequest request) {
        ProductResponse updated = productService.updateProduct(id, request);
        return ResponseEntity.ok(ApiResponse.success(updated, "Product updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable("id") Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Product deleted successfully"));
    }
}
