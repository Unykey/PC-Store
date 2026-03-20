package com.sba301.code.be.service;

import com.sba301.code.be.model.entity.PcComponent;
import com.sba301.code.be.repository.PcComponentRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class ComponentServiceImpl implements ComponentService {
    private final PcComponentRepository pcComponentRepository;

    @Override
    public List<Map<String, Object>> getComponentsByType(String type) {
        // 1. Lấy toàn bộ linh kiện từ Database
        List<PcComponent> allComponents = pcComponentRepository.findAll();

        // 2. Lọc và ép kiểu dữ liệu sang DTO (Map) cho Frontend
        return allComponents.stream()
                // Lọc những linh kiện có tên Class khớp với chữ truyền vào (Cpu, Ram, Gpu...)
                .filter(comp -> comp.getClass().getSimpleName().equalsIgnoreCase(type))
                .map(comp -> {
                    Map<String, Object> dto = new HashMap<>();
                    dto.put("id", comp.getProductId());
                    dto.put("name", comp.getName());
                    dto.put("price", comp.getPrice() != null ? comp.getPrice().doubleValue() : 0.0);
                    dto.put("description", comp.getDescription() != null ? comp.getDescription() : "Chưa có mô tả");
                    dto.put("type", comp.getClass().getSimpleName());
                    return dto;
                })
                .collect(Collectors.toList());
    }
}
