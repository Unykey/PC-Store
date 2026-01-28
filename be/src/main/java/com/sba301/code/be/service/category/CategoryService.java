package com.sba301.code.be.service.category;

import com.sba301.code.be.dto.request.CategoryRequest;
import com.sba301.code.be.dto.response.CategoryResponse;
import com.sba301.code.be.model.entity.Category;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface CategoryService {
    public List<CategoryResponse> getAllCategories();
    public CategoryResponse getCategoryById(Long CategoryId);
    public CategoryResponse createCategory(CategoryRequest category);
    public CategoryResponse updateCategory(Long CategoryId, CategoryRequest category);
    public void deleteCategory(Long categoryId);
}
