package com.sba301.code.be.service;

import com.sba301.code.be.model.entity.Category;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface CategoryService {
    public List<Category> getAllCategories();
    public Category getCategoryById(int categoryId);
    public Category createCategory(Category category);
    public Category updateCategory(int categoryId, Category category);
    public void deleteCategory(int categoryId);
}
