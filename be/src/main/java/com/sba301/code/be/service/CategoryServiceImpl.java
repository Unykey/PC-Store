package com.sba301.code.be.service;

import com.sba301.code.be.dto.request.CategoryRequest;
import com.sba301.code.be.dto.response.CategoryResponse;
import com.sba301.code.be.model.entity.Category;
import com.sba301.code.be.repository.CategoryRepository;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class CategoryServiceImpl implements CategoryService {
    @Autowired
    private CategoryRepository categoryRepository;

    @Override
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll()
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    @Override
    public CategoryResponse getCategoryById(Long categoryId) {
        return categoryRepository.findById(categoryId)
                .map(this::convertToResponse)
                .orElse(null);
    }

    @Override
    public CategoryResponse createCategory(CategoryRequest categoryRequest) {
        Category category = new Category();
        category.setName(categoryRequest.getName());
        category.setDescription(categoryRequest.getDescription());
        Category savedCategory = categoryRepository.save(category);
        return convertToResponse(savedCategory);
    }

    @Override
    public CategoryResponse updateCategory(Long CategoryId, CategoryRequest categoryRequest) {
        Category category = categoryRepository.findById(CategoryId).orElseThrow(() -> new RuntimeException("Category not found"));
        category.setName(categoryRequest.getName());
        category.setDescription(categoryRequest.getDescription());
        Category savedCategory = categoryRepository.save(category);
        return convertToResponse(savedCategory);
    }

    @Override
    public void deleteCategory(Long categoryId) {
        categoryRepository.deleteById(categoryId);
    }

    @Override
    public CategoryResponse getCategoryByName(String name) {
        Category category = categoryRepository.findByName(name).orElseThrow(() -> new RuntimeException("Category not found"));
        return convertToResponse(category);
    }

    @Override
    public List<CategoryResponse> getCategoriesByIds(List<Long> categoryIds) {
        List<Category> categories = categoryRepository.findAllById(categoryIds);
        return categories.stream()
                .map(this::convertToResponse)
                .toList();
    }

    @Override
    public List<CategoryResponse> getCategoriesByName(String categoryName) {
        List<Category> categories = categoryRepository.findAllByNameContainingIgnoreCase(categoryName);
        return categories.stream()
                .map(this::convertToResponse)
                .toList();
    }

    private CategoryResponse convertToResponse(Category category) {
        CategoryResponse response = new CategoryResponse();
        response.setCategoryId(category.getCategoryId());
        response.setName(category.getName());
        response.setDescription(category.getDescription());
        return response;
    }
}
