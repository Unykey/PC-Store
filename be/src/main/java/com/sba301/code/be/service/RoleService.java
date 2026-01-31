package com.sba301.code.be.service;

import com.sba301.code.be.model.entity.Role;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface RoleService {
    public List<Role> getAllRoles();
    public Role getRoleById(Long roleId);
    public Role createRole(Role role);
    public Role updateRole(Long roleId, Role role);
    public void deleteRole(Long roleId);
}
