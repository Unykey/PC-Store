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
    public ResponseEntity<Map<String, Object>> searchComponents(
            @RequestParam Map<String, String> params,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "16") int size
    ) {
        try {
            Map<String, Object> response = componentService.searchComponents(params, page, size);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}