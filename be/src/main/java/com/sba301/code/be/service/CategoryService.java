package com.sba301.code.be.service;

import com.sba301.code.be.entity.Category;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface CategoryService {
    Category addCategory(Category category);

    Category getCategoryById(Long categoryId);

    Category updateCategory(Long categoryId, Category categoryDetails);

    void deleteCategory(Long categoryId);

    List<Category> getAllCategories();
}
