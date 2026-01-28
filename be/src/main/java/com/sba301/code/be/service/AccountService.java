package com.sba301.code.be.service;

import com.sba301.code.be.dto.request.LoginDto;
import com.sba301.code.be.dto.request.RegisterDto;
import com.sba301.code.be.dto.response.JWTAuthResponse;
import com.sba301.code.be.model.entity.Account;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface AccountService {
    public List<Account> getAllAccounts();
    public Account getAccountById(Long accountId);
    public Account createAccount(Account account);
    public Account updateAccount(Long accountId, Account account);
    public void deleteAccount(Long accountId);

    JWTAuthResponse authenticateUser(LoginDto loginDto);
    String registerUser(RegisterDto registerDto);
}
