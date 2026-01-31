package com.sba301.code.be.service;

import com.sba301.code.be.model.entity.Category;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface CategoryService {
    public List<Category> getAllCategories();
    public Category getCategoryById(Long categoryId);
    public Category createCategory(Category category);
    public Category updateCategory(Long categoryId, Category category);
    public void deleteCategory(Long categoryId);
}
