package com.sba301.code.be.service;

import com.sba301.code.be.dto.request.LoginDto;
import com.sba301.code.be.dto.request.RegisterDto;
import com.sba301.code.be.dto.response.JWTAuthResponse;
import com.sba301.code.be.model.entity.Account;
import com.sba301.code.be.model.entity.Role;
import com.sba301.code.be.repository.AccountRepository;
import com.sba301.code.be.repository.RoleRepository;
import com.sba301.code.be.security.JwtTokenProvider;
import lombok.AllArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class AccountServiceImpl implements AccountService{
    private final AccountRepository accountRepository;
    private final RoleRepository roleRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;


    @Override
    public List<Account> getAllAccounts() {
        return accountRepository.findAll();
    }

    @Override
    public Account getAccountById(Long accountId) {
        return accountRepository.findById(accountId).orElseThrow(() -> new RuntimeException("Account not found"));
    }

    @Override
    public Account createAccount(Account account) {
        if (account.getPassword() != null) {
            account.setPassword(passwordEncoder.encode(account.getPassword()));
        }
        // assign default role if not set
        if (account.getRole() == null) {
            Role role = roleRepository.findByRoleName("CUSTOMER")
                    .orElseThrow(() -> new RuntimeException("Role not found"));
            account.setRole(role);
        }
        return accountRepository.save(account);
    }

    @Override
    public Account updateAccount(Long accountId, Account account) {
        Account existing = accountRepository.findById(accountId).orElseThrow(() -> new RuntimeException("Account not found"));
        if (account.getFullName() != null) existing.setFullName(account.getFullName());
        if (account.getEmail() != null) existing.setEmail(account.getEmail());
        if (account.getPhoneNumber() != null) existing.setPhoneNumber(account.getPhoneNumber());
        if (account.getPassword() != null) existing.setPassword(passwordEncoder.encode(account.getPassword()));
        if (account.getRole() != null) existing.setRole(account.getRole());
        return accountRepository.save(existing);
    }

    @Override
    public void deleteAccount(Long accountId) {
        accountRepository.deleteById(accountId);
    }

    // --- Logic Login ---
    @Override
    public JWTAuthResponse authenticateUser(LoginDto loginDto) {
        // 1. Xác thực qua AuthenticationManager
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginDto.getEmail(),
                        loginDto.getPassword()
                )
        );

        // 2. Set Context
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // 3. Generate Token
        String token = jwtTokenProvider.generateToken(authentication);

        return new JWTAuthResponse(token);
    }

    // --- Logic Register ---
    @Override
    public String registerUser(RegisterDto registerDto) {
        // 1. Check tồn tại
        if (accountRepository.existsByEmail(registerDto.getEmail())) {
            throw new RuntimeException("Email already exists!"); // Nên dùng Custom Exception
        }

        // 2. Tạo Entity
        Account account = new Account();
        account.setFullName(registerDto.getFullName());
        account.setEmail(registerDto.getEmail());
        account.setPhoneNumber(registerDto.getPhoneNumber());
        account.setPassword(passwordEncoder.encode(registerDto.getPassword()));

        // 3. Gán Role mặc định (CUSTOMER)
        Role role = roleRepository.findByRoleName("CUSTOMER") // Hoặc findByName tùy repository của bạn
                .orElseThrow(() -> new RuntimeException("Role not found"));
        account.setRole(role);

        // 4. Lưu
        accountRepository.save(account);

        return "User registered successfully!";
    }

    @Override
    public List<Account> searchAccounts(String query) {
        if (query == null || query.isBlank()) return List.of();
        String q = query.trim();

        // numeric id search
        try {
            Long id = Long.parseLong(q);
            return accountRepository.findById(id).map(List::of).orElse(List.of());
        } catch (NumberFormatException ignored) {}

        String lower = q.toLowerCase();
        return accountRepository.findAll().stream()
                .filter(a -> (a.getFullName() != null && a.getFullName().toLowerCase().contains(lower))
                        || (a.getEmail() != null && a.getEmail().toLowerCase().contains(lower)))
                .toList();
    }
}
