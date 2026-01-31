package com.sba301.code.be.service;

import com.sba301.code.be.model.entity.Role;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface RoleService {
    public List<Role> getAllRoles();
    public Role getRoleById(long roleId);
    public Role createRole(Role role);
    public Role updateRole(long roleId, Role role);
    public void deleteRole(long roleId);
}
