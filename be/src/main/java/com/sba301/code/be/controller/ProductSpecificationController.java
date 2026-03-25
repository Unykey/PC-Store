package com.sba301.code.be.controller;

import com.sba301.code.be.dto.request.ProductSpecificationRequest;
import com.sba301.code.be.dto.response.ApiResponse;
import com.sba301.code.be.dto.response.ProductSpecificationResponse;
import com.sba301.code.be.service.ProductSpecificationService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/specifications")
@AllArgsConstructor
public class ProductSpecificationController {

    private final ProductSpecificationService specService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductSpecificationResponse>>> getAll() {
        List<ProductSpecificationResponse> specs = specService.getAll();
        return ResponseEntity.ok(ApiResponse.success(specs, "Get all specifications successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductSpecificationResponse>> getById(@PathVariable Long id) {
        ProductSpecificationResponse spec = specService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(spec, "Get specification successfully"));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<List<ProductSpecificationResponse>>> getByProductId(@PathVariable Long productId) {
        List<ProductSpecificationResponse> specs = specService.getByProductId(productId);
        return ResponseEntity.ok(ApiResponse.success(specs, "Get specifications by product successfully"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProductSpecificationResponse>> create(@RequestBody ProductSpecificationRequest request) {
        ProductSpecificationResponse created = specService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(created, "Specification created successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductSpecificationResponse>> update(@PathVariable Long id,
                                                                            @RequestBody ProductSpecificationRequest request) {
        ProductSpecificationResponse updated = specService.update(id, request);
        return ResponseEntity.ok(ApiResponse.success(updated, "Specification updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        specService.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Specification deleted successfully"));
    }
}