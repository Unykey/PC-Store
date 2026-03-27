package com.sba301.code.be.repository.component;

import com.sba301.code.be.model.entity.component.Cooler;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CoolerRepository extends JpaRepository<Cooler, Long> {
}
