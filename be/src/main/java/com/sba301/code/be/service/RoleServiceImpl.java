package com.sba301.code.be.service;

import com.sba301.code.be.dto.request.RoleRequest;
import com.sba301.code.be.dto.response.RoleResponse;
import com.sba301.code.be.model.entity.Role;
import com.sba301.code.be.repository.RoleRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@AllArgsConstructor
@Service
public class RoleServiceImpl implements RoleService {

    private final RoleRepository roleRepository;

    @Override
    public List<RoleResponse> getAllRoles() {
        return roleRepository.findAll()
                .stream()
                .map(RoleResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public RoleResponse getRoleById(long roleId) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new IllegalArgumentException("Role not found with id: " + roleId));
        return RoleResponse.fromEntity(role);
    }

    @Override
    public RoleResponse createRole(RoleRequest roleRequest) {
        Role toSave = roleRequest.toEntity();
        toSave.setRoleId(null);
        Role saved = roleRepository.save(toSave);
        return RoleResponse.fromEntity(saved);
    }

    @Override
    public RoleResponse updateRole(long roleId, RoleRequest roleRequest) {
        Role existing = roleRepository.findById(roleId)
                .orElseThrow(() -> new IllegalArgumentException("Role not found with id: " + roleId));
        existing.setRoleName(roleRequest.getRoleName());
        Role saved = roleRepository.save(existing);
        return RoleResponse.fromEntity(saved);
    }

    @Override
    public void deleteRole(long roleId) {
        if (!roleRepository.existsById(roleId)) {
            throw new IllegalArgumentException("Role not found with id: " + roleId);
        }
        roleRepository.deleteById(roleId);
    }
}