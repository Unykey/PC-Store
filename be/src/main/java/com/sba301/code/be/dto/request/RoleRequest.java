package com.sba301.code.be.dto.request;

import com.sba301.code.be.model.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for creating/updating roles.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoleRequest {
    private String roleName;

    public Role toEntity() {
        Role r = new Role();
        r.setRoleName(this.roleName);
        // leave id null so JPA will generate it
        return r;
    }
}