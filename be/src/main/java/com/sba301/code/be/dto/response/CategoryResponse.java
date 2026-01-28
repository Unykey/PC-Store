package com.sba301.code.be.dto.response;

import lombok.Data;

@Data
public class CategoryResponse {
    private Long categoryId;
    private String name;
    private String description;
}