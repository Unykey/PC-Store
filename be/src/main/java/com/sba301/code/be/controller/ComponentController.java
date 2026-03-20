package com.sba301.code.be.controller;

import com.sba301.code.be.service.ComponentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/components")
@CrossOrigin(origins = "*")
public class ComponentController {

    private final ComponentService componentService;

    public ComponentController(ComponentService componentService) {
        this.componentService = componentService;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getComponentsByType(@RequestParam("type") String type) {
        try {
            List<Map<String, Object>> components = componentService.getComponentsByType(type);
            return ResponseEntity.ok(components);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}