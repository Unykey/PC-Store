package com.sba301.code.be.service;

import com.sba301.code.be.model.entity.Role;
import com.sba301.code.be.repository.RoleRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class RoleServiceImpl implements RoleService {

    private final RoleRepository roleRepository;

    @Override
    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

    @Override
    public Role getRoleById(long roleId) {
        return roleRepository.findById(roleId)
                .orElseThrow(() -> new IllegalArgumentException("Role not found with id: " + roleId));
    }

    @Override
    public Role createRole(Role role) {
        role.setRoleId(null);
        return roleRepository.save(role);
    }

    @Override
    public Role updateRole(long roleId, Role role) {
        Role existing = getRoleById(roleId);
        // copy fields from incoming role to existing role; adjust as needed
        existing.setRoleName(role.getRoleName());
        return roleRepository.save(existing);
    }

    @Override
    public void deleteRole(long roleId) {
        if (!roleRepository.existsById(roleId)) {
            throw new IllegalArgumentException("Role not found with id: " + roleId);
        }
        roleRepository.deleteById(roleId);
    }
}
