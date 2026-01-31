package com.sba301.code.be.controller;

import com.sba301.code.be.dto.request.RoleRequest;
import com.sba301.code.be.dto.response.RoleResponse;
import com.sba301.code.be.service.RoleService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@AllArgsConstructor
@RestController
@RequestMapping("/api/roles")
public class RoleController {

    private final RoleService roleService;

    @GetMapping
    public List<RoleResponse> getAllRoles() {
        return roleService.getAllRoles();
    }

    @GetMapping("/{id}")
    public RoleResponse getRoleById(@PathVariable("id") long id) {
        return roleService.getRoleById(id);
    }

    @PostMapping
    public ResponseEntity<RoleResponse> createRole(@RequestBody RoleRequest roleRequest) {
        RoleResponse created = roleService.createRole(roleRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public RoleResponse updateRole(@PathVariable("id") long id, @RequestBody RoleRequest roleRequest) {
        return roleService.updateRole(id, roleRequest);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRole(@PathVariable("id") long id) {
        roleService.deleteRole(id);
        return ResponseEntity.noContent().build();
    }
}