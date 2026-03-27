package com.sba301.code.be.controller;

import com.sba301.code.be.dto.request.RegisterDto;
import com.sba301.code.be.dto.response.AccountResponse;
import com.sba301.code.be.dto.response.ApiResponse;
import com.sba301.code.be.dto.response.CustomerDetailResponse;
import com.sba301.code.be.dto.response.CustomerListResponse;
import com.sba301.code.be.dto.response.OrderResponse;
import com.sba301.code.be.model.entity.Account;
import com.sba301.code.be.model.entity.Role;
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
import java.math.BigDecimal;
import java.util.List;

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
        List<AccountResponse> accounts = accountService.getAllAccounts();
        List<CustomerListResponse> responses = accounts.stream()
                .map(this::toCustomerListResponse)
                .toList();
        return ResponseEntity.ok(ApiResponse.success(responses, "Customers retrieved"));
    }

    @GetMapping(value = "/{id}/orders", produces = "application/json")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getCustomerOrders(@PathVariable("id") Long id) {
        List<OrderResponse> orders = orderService.getOrdersByAccountId(id);
        return ResponseEntity.ok(ApiResponse.success(orders, "Customer orders retrieved"));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CustomerDetailResponse>> getCustomer(@PathVariable Long id) {
        AccountResponse acc = accountService.getAccountById(id);
        CustomerDetailResponse detail = toCustomerDetailResponse(acc);
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
        roleRepository.findByRoleName("CUSTOMER").ifPresent(account::setRole);

        AccountResponse created = accountService.createAccount(account);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(created, "Customer created"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AccountResponse>> updateCustomer(
            @PathVariable Long id,
            @Valid @RequestBody RegisterDto request) {
        Account account = new Account();
        account.setFullName(request.getFullName());
        account.setEmail(request.getEmail());
        account.setPhoneNumber(request.getPhoneNumber());
        account.setAddress(request.getAddress());
        account.setPassword(request.getPassword());

        AccountResponse updated = accountService.updateAccount(id, account);
        return ResponseEntity.ok(ApiResponse.success(updated, "Customer updated"));
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
        List<AccountResponse> matches = accountService.searchAccounts(q);
        List<CustomerListResponse> responses = matches.stream()
                .map(this::toCustomerListResponse)
                .toList();
        return ResponseEntity.ok(ApiResponse.success(responses, "Search results"));
    }

    // --- Helpers ---

    private CustomerListResponse toCustomerListResponse(AccountResponse a) {
        int ordersCount = a.getOrders() != null ? a.getOrders().size() : 0;
        BigDecimal total = a.getOrders() == null ? BigDecimal.ZERO : a.getOrders().stream()
                .map(o -> o.getTotalAmount() == null ? BigDecimal.ZERO : o.getTotalAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        CustomerListResponse r = new CustomerListResponse();
        r.setAccountId(a.getId());
        r.setFullName(a.getFullName());
        r.setEmail(a.getEmail());
        r.setPhoneNumber(a.getPhoneNumber());
        r.setAddress(a.getAddress());
        r.setOrdersCount(ordersCount);
        r.setTotalSpent(total);
        r.setJoinDate(null);
        r.setStatus("Active");
        return r;
    }

    private CustomerDetailResponse toCustomerDetailResponse(AccountResponse a) {
        List<Long> orderIds = a.getOrders() == null ? List.of() :
                a.getOrders().stream().map(OrderResponse::getOrderId).toList();
        int ordersCount = orderIds.size();
        BigDecimal total = a.getOrders() == null ? BigDecimal.ZERO : a.getOrders().stream()
                .map(o -> o.getTotalAmount() == null ? BigDecimal.ZERO : o.getTotalAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        CustomerDetailResponse detail = new CustomerDetailResponse();
        detail.setAccountId(a.getId());
        detail.setFullName(a.getFullName());
        detail.setEmail(a.getEmail());
        detail.setPhoneNumber(a.getPhoneNumber());
        detail.setAddress(a.getAddress());
        detail.setOrderIds(orderIds);
        detail.setOrdersCount(ordersCount);
        detail.setTotalSpent(total);
        detail.setJoinDate(null);
        detail.setStatus("Active");
        return detail;
    }
}