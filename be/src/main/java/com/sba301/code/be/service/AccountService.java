package com.sba301.code.be.service;

import com.sba301.code.be.entity.Account;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface AccountService {
    public List<Account> getAllAccounts();
    public Account getAccountById(int accountId);
    public Account createAccount(Account account);
    public Account updateAccount(int accountId, Account account);
    public void deleteAccount(int accountId);
}
