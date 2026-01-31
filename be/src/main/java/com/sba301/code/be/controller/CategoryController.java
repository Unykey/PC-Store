package com.sba301.code.be.controller;

import com.sba301.code.be.dto.request.CategoryRequest;
import com.sba301.code.be.dto.response.ApiResponse;
import com.sba301.code.be.dto.response.CategoryResponse;
import com.sba301.code.be.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAllCategories() {
        List<CategoryResponse> categories = categoryService.getAllCategories();
        return ResponseEntity.ok(ApiResponse.success(categories));
    }

    @GetMapping("/{categoryId}")
    public ResponseEntity<ApiResponse<CategoryResponse>> getCategoryById(@PathVariable Long categoryId) {
        CategoryResponse category = categoryService.getCategoryById(categoryId);
        return ResponseEntity.ok(ApiResponse.success(category));
    }

    @GetMapping("/name/{name}")
    public ResponseEntity<ApiResponse<CategoryResponse>> getCategoryByName(@PathVariable String name) {
        CategoryResponse category = categoryService.getCategoryByName(name);
        return ResponseEntity.ok(ApiResponse.success(category));
    }

    // NEW: Get multiple categories by IDs (bulk fetch)
    @GetMapping("/bulk/ids")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getCategoriesByIds(
            @RequestParam List<Long> ids) {
        List<CategoryResponse> categories = categoryService.getCategoriesByIds(ids);
        return ResponseEntity.ok(ApiResponse.success(categories));
    }

    // NEW: Search categories by names (partial match)
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getCategoriesByNames(
            @RequestParam String names) {
        List<CategoryResponse> categories = categoryService.getCategoriesByName(names);
        return ResponseEntity.ok(ApiResponse.success(categories));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(
            @Valid @RequestBody CategoryRequest categoryRequest) {
        CategoryResponse createdCategory = categoryService.createCategory(categoryRequest);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(createdCategory, "Category created successfully"));
    }

    @PutMapping("/{categoryId}")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(
            @PathVariable Long categoryId,
            @Valid @RequestBody CategoryRequest categoryRequest) {
        CategoryResponse updatedCategory = categoryService.updateCategory(categoryId, categoryRequest);
        return ResponseEntity.ok(ApiResponse.success(updatedCategory, "Category updated successfully"));
    }

    @DeleteMapping("/{categoryId}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long categoryId) {
        categoryService.deleteCategory(categoryId);
        return ResponseEntity.ok(ApiResponse.success(null, "Category deleted successfully"));
    }
}
