package com.sba301.code.be.service;

import com.sba301.code.be.dto.request.RoleRequest;
import com.sba301.code.be.dto.response.RoleResponse;

import java.util.List;

public interface RoleService {
    List<RoleResponse> getAllRoles();
    RoleResponse getRoleById(long roleId);
    RoleResponse createRole(RoleRequest roleRequest);
    RoleResponse updateRole(long roleId, RoleRequest roleRequest);
    void deleteRole(long roleId);
}