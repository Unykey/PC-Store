package com.sba301.code.be.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sba301.code.be.dto.response.ApiResponse;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {
    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException) throws IOException, ServletException {

        response.setContentType("application/json");
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // Code 401

        ApiResponse<Object> apiResponse = new ApiResponse<>();
        apiResponse.setStatus(401);
        apiResponse.setMessage("Unauthorized: Bạn cần đăng nhập để truy cập tài nguyên này.");
        apiResponse.setData(null);

        final ObjectMapper mapper = new ObjectMapper();
        mapper.writeValue(response.getOutputStream(), apiResponse);
    }
}