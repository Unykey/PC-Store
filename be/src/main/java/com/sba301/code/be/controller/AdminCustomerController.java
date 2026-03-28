package com.sba301.code.be.controller;

import com.sba301.code.be.dto.request.RegisterDto;
import com.sba301.code.be.dto.response.AccountResponse;
import com.sba301.code.be.dto.response.ApiResponse;
import com.sba301.code.be.dto.response.CustomerDetailResponse;
import com.sba301.code.be.dto.response.CustomerListResponse;
import com.sba301.code.be.dto.response.OrderResponse;
import com.sba301.code.be.model.entity.Account;
import com.sba301.code.be.service.AccountService;
import com.sba301.code.be.service.OrderService;
import com.sba301.code.be.repository.OrderRepository;
import com.sba301.code.be.repository.RoleRepository;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping(path = "/api/admin/customers", produces = "application/json")
@AllArgsConstructor
public class AdminCustomerController {

    private final AccountService accountService;
    private final RoleRepository roleRepository;
    private final OrderRepository orderRepository;
    private final OrderService orderService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<CustomerListResponse>>> listCustomers() {
        List<Account> accounts = accountService.getAllAccounts();
        List<CustomerListResponse> responses = accounts.stream().map(a -> {
            int ordersCount = orderRepository.findByAccount_AccountId(a.getAccountId()).size();
            java.math.BigDecimal total = orderRepository.findByAccount_AccountId(a.getAccountId()).stream()
                    .map(o -> o.getTotalAmount() == null ? java.math.BigDecimal.ZERO : o.getTotalAmount())
                    .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
            CustomerListResponse r = new CustomerListResponse();
            r.setAccountId(a.getAccountId());
            r.setFullName(a.getFullName());
            r.setEmail(a.getEmail());
            r.setPhoneNumber(a.getPhoneNumber());
            r.setAddress(a.getAddress());
            r.setOrdersCount(ordersCount);
            r.setTotalSpent(total);
            r.setJoinDate(null);
            r.setStatus("Active");
            return r;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(responses, "Customers retrieved"));
    }

    // New: return orders for a given customer (admin)
    @GetMapping(value = "/{id}/orders", produces = "application/json")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getCustomerOrders(@PathVariable("id") Long id) {
        List<OrderResponse> orders = orderService.getOrdersByAccountId(id);
        return ResponseEntity.ok(ApiResponse.success(orders, "Customer orders retrieved"));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CustomerDetailResponse>> getCustomer(@PathVariable Long id) {
        Account acc = accountService.getAccountById(id);
        // compute orders and totals
        List<com.sba301.code.be.model.entity.Order> orders = orderRepository.findByAccount_AccountId(acc.getAccountId());
        List<Long> orderIds = orders.stream().map(o -> o.getOrderId()).toList();
        int ordersCount = orderIds.size();
        java.math.BigDecimal total = orders.stream()
                .map(o -> o.getTotalAmount() == null ? java.math.BigDecimal.ZERO : o.getTotalAmount())
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);

        CustomerDetailResponse detail = new CustomerDetailResponse();
        detail.setAccountId(acc.getAccountId());
        detail.setFullName(acc.getFullName());
        detail.setEmail(acc.getEmail());
        detail.setPhoneNumber(acc.getPhoneNumber());
        detail.setAddress(acc.getAddress());
        detail.setOrderIds(orderIds);
        detail.setOrdersCount(ordersCount);
        detail.setTotalSpent(total);
        detail.setJoinDate(null);
        detail.setStatus("Active");

        return ResponseEntity.ok(ApiResponse.success(detail, "Customer retrieved"));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AccountResponse>> createCustomer(@Valid @RequestBody RegisterDto request) {
        Account account = new Account();
        account.setFullName(request.getFullName());
        account.setEmail(request.getEmail());
        account.setPhoneNumber(request.getPhoneNumber());
        account.setAddress(request.getAddress());
        account.setPassword(request.getPassword());

        // allow admin to set role to CUSTOMER explicitly, otherwise default will be set in service
        roleRepository.findByRoleName("CUSTOMER").ifPresent(account::setRole);

        Account created = accountService.createAccount(account);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(toResponse(created), "Customer created"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AccountResponse>> updateCustomer(@PathVariable Long id,
                                                                       @Valid @RequestBody RegisterDto request) {
        Account account = new Account();
        account.setFullName(request.getFullName());
        account.setEmail(request.getEmail());
        account.setPhoneNumber(request.getPhoneNumber());
        account.setAddress(request.getAddress());
        account.setPassword(request.getPassword());

        Account updated = accountService.updateAccount(id, account);
        return ResponseEntity.ok(ApiResponse.success(toResponse(updated), "Customer updated"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteCustomer(@PathVariable Long id) {
        accountService.deleteAccount(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Customer deleted"));
    }

    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<CustomerListResponse>>> searchCustomers(@RequestParam("q") String q) {
        List<Account> matches = accountService.searchAccounts(q);
        List<CustomerListResponse> responses = matches.stream().map(a -> {
            int ordersCount = orderRepository.findByAccount_AccountId(a.getAccountId()).size();
            java.math.BigDecimal total = orderRepository.findByAccount_AccountId(a.getAccountId()).stream()
                    .map(o -> o.getTotalAmount() == null ? java.math.BigDecimal.ZERO : o.getTotalAmount())
                    .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
            CustomerListResponse r = new CustomerListResponse();
            r.setAccountId(a.getAccountId());
            r.setFullName(a.getFullName());
            r.setEmail(a.getEmail());
            r.setPhoneNumber(a.getPhoneNumber());
            r.setAddress(a.getAddress());
            r.setOrdersCount(ordersCount);
            r.setTotalSpent(total);
            r.setJoinDate(null);
            r.setStatus("Active");
            return r;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(responses, "Search results"));
    }

    private AccountResponse toResponse(Account a) {
        AccountResponse r = new AccountResponse();
        r.setAccountName(a.getFullName());
        r.setEmail(a.getEmail());
        r.setPassword(a.getPassword());
        return r;
    }
}
