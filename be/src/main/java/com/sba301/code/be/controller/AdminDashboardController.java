package com.sba301.code.be.controller;

import com.sba301.code.be.dto.response.ApiResponse;
import com.sba301.code.be.dto.response.TopProductResponse;
import com.sba301.code.be.model.entity.Order;
import com.sba301.code.be.model.entity.OrderDetail;
import com.sba301.code.be.model.entity.Product;
import com.sba301.code.be.model.enums.OrderStatus;
import com.sba301.code.be.repository.OrderDetailRepository;
import com.sba301.code.be.repository.OrderRepository;
import com.sba301.code.be.repository.ProductRepository;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/dashboard")
@AllArgsConstructor
public class AdminDashboardController {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final OrderDetailRepository orderDetailRepository;

    // Total sales: sum of order.totalAmount across all orders
    @GetMapping("/total-sales")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<BigDecimal>> getTotalSales() {
        List<Order> orders = orderRepository.findAll();
        BigDecimal total = orders.stream()
                .map(Order::getTotalAmount)
                .filter(amount -> amount != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return ResponseEntity.ok(ApiResponse.success(total, "Total sales retrieved"));
    }

    // Total orders: count of orders
    @GetMapping("/total-orders")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Long>> getTotalOrders() {
        long count = orderRepository.count();
        return ResponseEntity.ok(ApiResponse.success(count, "Total orders retrieved"));
    }

    // Total products: count of products
    @GetMapping("/total-products")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Long>> getTotalProducts() {
        long count = productRepository.count();
        return ResponseEntity.ok(ApiResponse.success(count, "Total products retrieved"));
    }

    // Low stock: returns number of products with stock <= threshold (default 10)
    @GetMapping("/low-stock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Long>> getLowStockCount(@RequestParam(defaultValue = "10") int threshold) {
        List<Product> lowStock = productRepository.findByStockQuantityLessThanEqual(threshold);
        long count = lowStock == null ? 0L : lowStock.size();
        return ResponseEntity.ok(ApiResponse.success(count, "Low stock count retrieved"));
    }

    // Order status summary: counts grouped by OrderStatus
    @GetMapping("/order-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<OrderStatus, Long>>> getOrderStatusSummary() {
        List<Order> orders = orderRepository.findAll();
        Map<OrderStatus, Long> counts = Arrays.stream(OrderStatus.values())
                .collect(Collectors.toMap(status -> status, status -> 0L));

        orders.forEach(o -> counts.put(o.getOrderStatus(), counts.getOrDefault(o.getOrderStatus(), 0L) + 1));

        return ResponseEntity.ok(ApiResponse.success(counts, "Order status summary retrieved"));
    }

    // Top products: by quantity or sales amount (default by quantity), limit default 5
    @GetMapping("/top-products")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<TopProductResponse>>> getTopProducts(
            @RequestParam(defaultValue = "5") int limit,
            @RequestParam(defaultValue = "quantity") String sortBy // "quantity" or "sales"
    ) {
        List<OrderDetail> details = orderDetailRepository.findAll();

        // Aggregate by productId
        Map<Long, TopProductResponse> agg = new HashMap<>();
        for (OrderDetail d : details) {
            if (d.getProduct() == null) continue;
            Long pid = d.getProduct().getProductId();
            TopProductResponse t = agg.getOrDefault(pid, new TopProductResponse());
            if (t.getProductId() == null) {
                t.setProductId(pid);
                t.setProductName(d.getProduct().getName());
                t.setSerialNumber(d.getProduct().getSerialNumber());
                t.setTotalQuantitySold(0);
                t.setTotalSalesAmount(BigDecimal.ZERO);
            }
            t.setTotalQuantitySold(t.getTotalQuantitySold() + d.getQuantity());
            BigDecimal lineTotal = d.getPriceAtPurchase().multiply(BigDecimal.valueOf(d.getQuantity()));
            t.setTotalSalesAmount(t.getTotalSalesAmount().add(lineTotal));
            agg.put(pid, t);
        }

        Comparator<TopProductResponse> comparator = Comparator.comparingInt(TopProductResponse::getTotalQuantitySold).reversed();
        if ("sales".equalsIgnoreCase(sortBy)) {
            comparator = Comparator.comparing(TopProductResponse::getTotalSalesAmount).reversed();
        }

        List<TopProductResponse> top = agg.values().stream()
                .sorted(comparator)
                .limit(Math.max(0, limit))
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(top, "Top products retrieved"));
    }
}
