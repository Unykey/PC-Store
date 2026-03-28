package com.sba301.code.be.repository.component;

import com.sba301.code.be.model.entity.component.Gpu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GpuRepository extends JpaRepository<Gpu, Long> {
}