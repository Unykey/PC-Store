package com.sba301.code.be.security;

import com.sba301.code.be.model.entity.Account;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

@Getter
@AllArgsConstructor
public class CustomUserDetails implements UserDetails {
    private final Account account;

    // Mapping từ Role của bạn sang Quyền của Spring Security
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singleton(
                new SimpleGrantedAuthority("ROLE_" + account.getRole().getRoleName())
        );
    }

    @Override
    public String getPassword() {
        return account.getPassword();
    }

    @Override
    public String getUsername() {
        return account.getAccountName();
    }

    // Các thông tin bắt buộc khác của UserDetails (để mặc định là true)
    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }

    // Helper để lấy nhanh ID (rất hay dùng)
    public Long getAccountId() {
        return account.getAccountId();
    }

    public String getEmail() {
        return account.getEmail();
    }
}
