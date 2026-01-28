package com.sba301.code.be.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sba301.code.be.dto.response.ApiResponse;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class JwtAccessDeniedHandler implements AccessDeniedHandler {
    @Override
    public void handle(HttpServletRequest request,
                       HttpServletResponse response,
                       AccessDeniedException accessDeniedException) throws IOException, ServletException {

        response.setContentType("application/json");
        response.setStatus(HttpServletResponse.SC_FORBIDDEN); // Code 403

        ApiResponse<Object> apiResponse = new ApiResponse<>();
        apiResponse.setStatus(403);
        apiResponse.setMessage("Forbidden: Bạn không có quyền truy cập (Role không hợp lệ).");
        apiResponse.setData(null);

        final ObjectMapper mapper = new ObjectMapper();
        mapper.writeValue(response.getOutputStream(), apiResponse);
    }
}