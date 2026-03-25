package com.sba301.code.be.controller;

import com.sba301.code.be.dto.response.*;
import com.sba301.code.be.model.entity.Order;
import com.sba301.code.be.model.entity.OrderDetail;
import com.sba301.code.be.model.entity.Product;
import com.sba301.code.be.model.enums.OrderStatus;
import com.sba301.code.be.repository.AccountRepository;
import com.sba301.code.be.repository.OrderDetailRepository;
import com.sba301.code.be.repository.OrderRepository;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping(path = "/api/admin/reports", produces = "application/json")
@AllArgsConstructor
public class AdminReportsController {
    private final OrderRepository orderRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final AccountRepository accountRepository;

    @GetMapping("/sales-overview")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<MonthlySalesPointResponse>>> salesOverview(
            @RequestParam(defaultValue = "6") int months
    ) {
        int safeMonths = Math.min(24, Math.max(1, months));
        List<Order> orders = orderRepository.findAll();

        // Exclude cancelled orders from revenue charts
        List<Order> relevant = orders.stream()
                .filter(o -> o.getOrderStatus() != OrderStatus.CANCELLED)
                .toList();

        YearMonth now = YearMonth.now();
        Map<YearMonth, List<Order>> byMonth = relevant.stream()
                .filter(o -> o.getOrderDate() != null)
                .collect(Collectors.groupingBy(o -> YearMonth.from(o.getOrderDate())));

        List<MonthlySalesPointResponse> points = new ArrayList<>();
        for (int i = safeMonths - 1; i >= 0; i--) {
            YearMonth ym = now.minusMonths(i);
            List<Order> monthOrders = byMonth.getOrDefault(ym, List.of());
            BigDecimal sales = monthOrders.stream()
                    .map(Order::getTotalAmount)
                    .filter(Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            String label = ym.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            points.add(new MonthlySalesPointResponse(label, sales, monthOrders.size()));
        }

        return ResponseEntity.ok(ApiResponse.success(points, "Sales overview retrieved"));
    }

    @GetMapping("/category-revenue")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<CategoryRevenueResponse>>> categoryRevenue(
            @RequestParam(defaultValue = "6") int months
    ) {
        int safeMonths = Math.min(24, Math.max(1, months));
        LocalDate fromDate = LocalDate.now().minusMonths(safeMonths).withDayOfMonth(1);

        List<OrderDetail> details = orderDetailRepository.findAll();

        Map<Long, CategoryRevenueResponse> agg = new HashMap<>();
        for (OrderDetail d : details) {
            if (d.getOrder() == null || d.getOrder().getOrderDate() == null) continue;
            if (d.getOrder().getOrderStatus() == OrderStatus.CANCELLED) continue;
            if (d.getOrder().getOrderDate().toLocalDate().isBefore(fromDate)) continue;

            Product p = d.getProduct();
            if (p == null || p.getCategory() == null) continue;
            Long cid = p.getCategory().getCategoryId();

            CategoryRevenueResponse cr = agg.getOrDefault(cid, new CategoryRevenueResponse());
            if (cr.getCategoryId() == null) {
                cr.setCategoryId(cid);
                cr.setName(p.getCategory().getName());
                cr.setRevenue(BigDecimal.ZERO);
            }
            BigDecimal line = d.getPriceAtPurchase().multiply(BigDecimal.valueOf(d.getQuantity()));
            cr.setRevenue(cr.getRevenue().add(line));
            agg.put(cid, cr);
        }

        List<CategoryRevenueResponse> result = agg.values().stream()
                .sorted(Comparator.comparing(CategoryRevenueResponse::getRevenue).reversed())
                .toList();

        return ResponseEntity.ok(ApiResponse.success(result, "Category revenue retrieved"));
    }

    @GetMapping("/customer-insights")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CustomerInsightsResponse>> customerInsights(
            @RequestParam(defaultValue = "6") int months
    ) {
        int safeMonths = Math.min(24, Math.max(1, months));
        LocalDate fromDate = LocalDate.now().minusMonths(safeMonths).withDayOfMonth(1);

        List<Order> orders = orderRepository.findAll().stream()
                .filter(o -> o.getOrderDate() != null)
                .filter(o -> o.getOrderStatus() != OrderStatus.CANCELLED)
                .filter(o -> !o.getOrderDate().toLocalDate().isBefore(fromDate))
                .toList();

        // Total customers in system
        long totalCustomers = accountRepository.count();

        // Customers with orders in range
        Map<Long, LocalDate> firstOrderDateByAccount = new HashMap<>();
        BigDecimal totalRevenue = BigDecimal.ZERO;
        for (Order o : orders) {
            if (o.getAccount() == null || o.getAccount().getAccountId() == null) continue;
            Long aid = o.getAccount().getAccountId();
            LocalDate date = o.getOrderDate().toLocalDate();
            firstOrderDateByAccount.merge(aid, date, (prev, cur) -> cur.isBefore(prev) ? cur : prev);
            if (o.getTotalAmount() != null) {
                totalRevenue = totalRevenue.add(o.getTotalAmount());
            }
        }

        YearMonth current = YearMonth.now();
        long newCustomers = firstOrderDateByAccount.values().stream()
                .filter(d -> YearMonth.from(d).equals(current))
                .count();

        long distinctOrderingCustomers = firstOrderDateByAccount.size();
        long returningCustomers = Math.max(0, distinctOrderingCustomers - newCustomers);

        BigDecimal avgCustomerValue = distinctOrderingCustomers == 0
                ? BigDecimal.ZERO
                : totalRevenue.divide(BigDecimal.valueOf(distinctOrderingCustomers), 2, java.math.RoundingMode.HALF_UP);

        CustomerInsightsResponse resp = new CustomerInsightsResponse();
        resp.setTotalCustomers(totalCustomers);
        resp.setNewCustomers(newCustomers);
        resp.setReturningCustomers(returningCustomers);
        resp.setAvgCustomerValue(avgCustomerValue);

        return ResponseEntity.ok(ApiResponse.success(resp, "Customer insights retrieved"));
    }
}

