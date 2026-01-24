package com.sba301.code.be.service;

import com.sba301.code.be.entity.Category;
import com.sba301.code.be.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryServiceImpl implements CategoryService{
    @Autowired
    CategoryRepository categoryRepository;


    @Override
    public Category addCategory(Category category) {
        return null;
    }

    @Override
    public Category getCategoryById(Long categoryId) {
        return null;
    }

    @Override
    public Category updateCategory(Long categoryId, Category categoryDetails) {
        return null;
    }

    @Override
    public void deleteCategory(Long categoryId) {

    }

    @Override
    public List<Category> getAllCategories() {
        return List.of();
    }
}
