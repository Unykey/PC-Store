package com.sba301.code.be.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginDto {
    private String usernameOrEmail; // Hỗ trợ đăng nhập bằng username hoặc email
    private String password;
}
