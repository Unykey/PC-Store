package com.sba301.code.be.service;

import com.sba301.code.be.dto.request.LoginDto;
import com.sba301.code.be.dto.request.RegisterDto;
import com.sba301.code.be.dto.response.AccountResponse;
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
    private final OrderService orderService;


    @Override
    public List<AccountResponse> getAllAccounts() {
        return accountRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public AccountResponse getAccountById(Long accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found"));
        return toResponse(account);
    }

    @Override
    public AccountResponse createAccount(Account account) {
        if (account.getPassword() != null) {
            account.setPassword(passwordEncoder.encode(account.getPassword()));
        }
        // assign default role if not set
        if (account.getRole() == null) {
            Role role = roleRepository.findByRoleName("CUSTOMER")
                    .orElseThrow(() -> new RuntimeException("Role not found"));
            account.setRole(role);
        }
        return toResponse(accountRepository.save(account));
    }

    @Override
    public AccountResponse updateAccount(Long accountId, Account account) {
        Account existing = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found"));
        if (account.getFullName() != null) existing.setFullName(account.getFullName());
        if (account.getEmail() != null) existing.setEmail(account.getEmail());
        if (account.getPhoneNumber() != null) existing.setPhoneNumber(account.getPhoneNumber());
        if (account.getPassword() != null) existing.setPassword(passwordEncoder.encode(account.getPassword()));
        if (account.getRole() != null) existing.setRole(account.getRole());
        return toResponse(accountRepository.save(existing));
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
    public List<AccountResponse> searchAccounts(String query) {
        if (query == null || query.isBlank()) return List.of();
        String q = query.trim();

        // Numeric id search
        try {
            Long id = Long.parseLong(q);
            return accountRepository.findById(id)
                    .map(a -> List.of(toResponse(a)))
                    .orElse(List.of());
        } catch (NumberFormatException ignored) {}

        return filterAccountsByQuery(accountRepository.findAll(), q.toLowerCase());
    }

    // --- Helpers ---

    private List<AccountResponse> filterAccountsByQuery(List<Account> accounts, String lower) {
        return accounts.stream()
                .filter(a -> (a.getFullName() != null && a.getFullName().toLowerCase().contains(lower))
                        || (a.getEmail() != null && a.getEmail().toLowerCase().contains(lower)))
                .map(this::toResponse)
                .toList();
    }

    private AccountResponse toResponse (Account account){
        AccountResponse response = new AccountResponse();
        response.setId(account.getAccountId());
        response.setEmail(account.getEmail());
        response.setRole(account.getRole());
        response.setAddress(account.getAddress());
        response.setPhoneNumber(account.getPhoneNumber());

        response.setOrders(
                orderService.getOrdersByAccountId(account.getAccountId())
        );

        return response;
    }
}
