package com.sba301.code.be.dto.response;

import com.sba301.code.be.model.entity.Order;
import com.sba301.code.be.model.entity.Role;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AccountResponse {
    private Long id;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String address;
    private Role role;
    private List<OrderResponse> orders;
}
