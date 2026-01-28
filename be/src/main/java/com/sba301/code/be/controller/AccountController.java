package com.sba301.code.be.controller;

import com.sba301.code.be.dto.response.ApiResponse;
import com.sba301.code.be.model.entity.Account;
import com.sba301.code.be.service.AccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {
    @Autowired
    private AccountService accountService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<List<Account>>> getAllAccounts() {
        List<Account> accounts  = accountService.getAllAccounts();
        return ResponseEntity.ok(ApiResponse.success(accounts, "Get all accounts successfully"));
    }
}
