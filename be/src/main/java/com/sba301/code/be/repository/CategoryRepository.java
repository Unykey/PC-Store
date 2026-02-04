package com.sba301.code.be.repository;

import com.sba301.code.be.dto.response.CategoryResponse;
import com.sba301.code.be.model.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findByName(String name);

    List<Category> findAllByNameContainingIgnoreCase(String name);
}
