package com.sba301.code.be.controller;

import com.sba301.code.be.dto.request.RegisterDto;
import com.sba301.code.be.dto.response.ApiResponse;
import com.sba301.code.be.dto.response.JWTAuthResponse;
import com.sba301.code.be.dto.request.LoginDto;
import com.sba301.code.be.security.JwtTokenProvider;
import com.sba301.code.be.service.AccountService;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@AllArgsConstructor
public class AuthController {
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final AccountService accountService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<JWTAuthResponse>> authenticateUser(@Valid @RequestBody LoginDto loginDto) {
        JWTAuthResponse jwtAuthResponse = accountService.authenticateUser(loginDto);
        return ResponseEntity.ok(ApiResponse.success(jwtAuthResponse, "Login successfully"));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<String>> registerUser(@Valid @RequestBody RegisterDto registerDto) {
        String message = accountService.registerUser(registerDto);
        return ResponseEntity.ok(ApiResponse.success(message, "User registered successfully!"));
    }
}
