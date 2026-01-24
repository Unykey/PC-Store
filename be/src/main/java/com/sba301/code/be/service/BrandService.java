package com.sba301.code.be.service;

import com.sba301.code.be.entity.Brand;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface BrandService {
    Brand createBrand(Brand brand);

    Brand getBrandById(Long brandId);

    Brand updateBrand(Long brandId, Brand brandDetails);

    void deleteBrand(Long brandId);

    List<Brand> getAllBrands();
}
