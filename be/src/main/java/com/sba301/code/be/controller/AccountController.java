package com.sba301.code.be.controller;

import com.sba301.code.be.dto.request.RegisterDto;
import com.sba301.code.be.dto.response.AccountResponse;
import com.sba301.code.be.dto.response.ApiResponse;
import com.sba301.code.be.model.entity.Account;
import com.sba301.code.be.service.AccountService;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/accounts")
@AllArgsConstructor
public class AccountController {

    private AccountService accountService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<List<AccountResponse>>> getAllAccounts() {
        return ResponseEntity.ok(ApiResponse.success(accountService.getAllAccounts(), "success"));
    }

    @GetMapping("{id}")
    public ResponseEntity<ApiResponse<AccountResponse>> getAccount(@PathVariable Long id) {
        AccountResponse accountResponse = accountService.getAccountById(id);

        ApiResponse<AccountResponse> apiResponse = new ApiResponse<>();
        apiResponse.setStatus(HttpStatus.OK.value());
        apiResponse.setData(accountResponse);
        apiResponse.setMessage("success");

        return ResponseEntity.ok(ApiResponse.success(accountResponse, "success"));
    }

    @PutMapping("{id}")
    public ResponseEntity<ApiResponse<AccountResponse>> updateAccount(@PathVariable Long id, @RequestBody RegisterDto request) {
        Account account = new Account();
        account.setFullName(request.getFullName());
        account.setEmail(request.getEmail());
        account.setPassword(request.getPassword());

        return ResponseEntity.ok(ApiResponse.success(accountService.updateAccount(id, account), "updated"));
    }

    @DeleteMapping("{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAccount(@PathVariable Long id) {
        accountService.deleteAccount(id);

        ApiResponse<Void> apiResponse =
                ApiResponse.success(null, "deleted");

        return ResponseEntity.ok(apiResponse);
    }
}
