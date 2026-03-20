package com.sba301.code.be.service;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public interface ComponentService {
    List<Map<String, Object>> getComponentsByType(String type);
}
