package com.sba301.code.be.repository.component;

import com.sba301.code.be.model.entity.component.Cpu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CpuRepository extends JpaRepository<Cpu, Long> {
    // Tìm CPU theo socket để build PC
    List<Cpu> findBySocket(String socket);
}