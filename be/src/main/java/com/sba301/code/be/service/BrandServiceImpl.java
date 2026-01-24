package com.sba301.code.be.service;

import com.sba301.code.be.entity.Brand;
import com.sba301.code.be.repository.BrandRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BrandServiceImpl implements BrandService{
    
    @Autowired
    BrandRepository brandRepository;

    @Override
    public Brand createBrand(Brand brand) {
        return null;
    }

    @Override
    public Brand getBrandById(Long brandId) {
        return null;
    }

    @Override
    public Brand updateBrand(Long brandId, Brand brandDetails) {
        return null;
    }

    @Override
    public void deleteBrand(Long brandId) {

    }

    @Override
    public List<Brand> getAllBrands() {
        return List.of();
    }
}
