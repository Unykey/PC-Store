package com.sba301.code.be.dto.response;

import com.sba301.code.be.model.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for role data returned by the API.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoleResponse {
    private Long roleId;
    private String roleName;

    public static RoleResponse fromEntity(Role role) {
        if (role == null) return null;
        return new RoleResponse(role.getRoleId(), role.getRoleName());
    }
}