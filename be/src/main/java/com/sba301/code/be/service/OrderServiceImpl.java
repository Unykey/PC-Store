package com.sba301.code.be.service;

import com.sba301.code.be.dto.request.OrderCreateRequest;
import com.sba301.code.be.dto.request.OrderItemRequest;
import com.sba301.code.be.dto.response.OrderDetailResponse;
import com.sba301.code.be.dto.response.OrderResponse;
import com.sba301.code.be.model.entity.*;
import com.sba301.code.be.model.enums.OrderStatus;
import com.sba301.code.be.repository.*;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class OrderServiceImpl implements OrderService {
    private final OrderRepository orderRepository;
    private final AccountRepository accountRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional(rollbackFor = Exception.class) // Rollback nếu có lỗi xảy ra
    public OrderResponse placeOrder(OrderCreateRequest request) {
        // 1. Tìm người mua
        Account account = accountRepository.findById(request.getAccountId())
                .orElseThrow(() -> new RuntimeException("Account not found with ID: " + request.getAccountId()));

        // 2. Khởi tạo Order
        Order order = new Order();
        order.setAccount(account);
        order.setOrderDate(LocalDateTime.now());
        order.setOrderStatus(OrderStatus.PENDING);

        BigDecimal totalAmount = BigDecimal.ZERO;
        Set<OrderDetail> orderDetails = new HashSet<>();

        // 3. Xử lý từng sản phẩm trong giỏ hàng
        for (OrderItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found with ID: " + itemReq.getProductId()));

            // Check tồn kho
            if (product.getStockQuantity() < itemReq.getQuantity()) {
                throw new RuntimeException("Product " + product.getName() + " is out of stock (Available: " + product.getStockQuantity() + ")");
            }

            // Trừ tồn kho (Optional: Tùy nghiệp vụ có trừ ngay không)
            product.setStockQuantity(product.getStockQuantity() - itemReq.getQuantity());
            productRepository.save(product);

            // Tạo OrderDetail
            OrderDetail detail = new OrderDetail();
            detail.setOrder(order);
            detail.setProduct(product);
            detail.setQuantity(itemReq.getQuantity());
            detail.setPriceAtPurchase(product.getPrice());

            // Tính tiền: giá * số lượng
            BigDecimal lineTotal = product.getPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            totalAmount = totalAmount.add(lineTotal);

            orderDetails.add(detail);
        }

        // 4. Set dữ liệu tính toán được vào Order
        order.setTotalAmount(totalAmount);
        order.setOrderDetails(orderDetails); // Set list chi tiết vào

        // 5. Lưu xuống DB (Cascade sẽ lưu luôn OrderDetail)
        Order savedOrder = orderRepository.save(order);
        return mapToResponse(savedOrder);
    }

    @Override
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll().stream().map(this::mapToResponse).toList();
    }

    @Override
    public OrderResponse getOrderById(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        return mapToResponse(order);
    }

    @Override
    public List<OrderResponse> getOrdersByAccountId(Long accountId) {
        List<Order> orders = orderRepository.findByAccount_AccountId(accountId);
        // Convert List<Order> -> List<OrderResponse>
        return orders.stream().map(this::mapToResponse).toList();
    }

    @Override
    public OrderResponse updateOrderStatus(Long orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));
        order.setOrderStatus(status);
        Order savedOrder = orderRepository.save(order);
        return mapToResponse(savedOrder);
    }

    @Override
    public OrderResponse cancelOrder(Long orderId, Long accountId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        // 1. Check quyền: Phải đúng là đơn của người này
        if (!order.getAccount().getAccountId().equals(accountId)) {
            throw new RuntimeException("Bạn không có quyền hủy đơn hàng này");
        }

        // 2. Check trạng thái: Chỉ được hủy khi đang chờ (PENDING)
        if (order.getOrderStatus() != OrderStatus.PENDING) {
            throw new RuntimeException("Đơn hàng đã được duyệt hoặc đang giao, không thể hủy!");
        }

        // 3. Thực hiện hủy
        order.setOrderStatus(OrderStatus.CANCELLED);

        // 4. (Quan trọng) Hoàn lại số lượng tồn kho cho sản phẩm
        for (OrderDetail detail : order.getOrderDetails()) {
            Product p = detail.getProduct();
            p.setStockQuantity(p.getStockQuantity() + detail.getQuantity());
            productRepository.save(p);
        }

        Order saved = orderRepository.save(order);
        return mapToResponse(saved);
    }

    private OrderResponse mapToResponse(Order order) {
        OrderResponse response = new OrderResponse();
        response.setOrderId(order.getOrderId());
        response.setOrderDate(order.getOrderDate());
        response.setOrderStatus(order.getOrderStatus());
        response.setTotalAmount(order.getTotalAmount());

        if (order.getAccount() != null) {
            response.setAccountId(order.getAccount().getAccountId());
            response.setAccountName(order.getAccount().getFullName());
        }

        if (order.getOrderDetails() != null) {
            List<OrderDetailResponse> details = order.getOrderDetails().stream().map(item -> {
                OrderDetailResponse itemRes = new OrderDetailResponse();
                itemRes.setProductId(item.getProduct().getProductId());
                itemRes.setProductName(item.getProduct().getName());
                itemRes.setQuantity(item.getQuantity());
                itemRes.setPrice(item.getPriceAtPurchase());
                return itemRes;
            }).toList();
            response.setOrderDetails(details);
        }
        return response;
    }

    private Order mapToOrder(OrderResponse response) {
        Order order = new Order();
        order.setOrderId(response.getOrderId());
        order.setOrderDate(response.getOrderDate());
        order.setOrderStatus(response.getOrderStatus());
        order.setTotalAmount(response.getTotalAmount());

        if (response.getAccountId() != null) {
            Account account = new Account();
            account.setAccountId(response.getAccountId());
            account.setFullName(response.getAccountName());
            order.setAccount(account);
        }

        if (response.getOrderDetails() != null) {
            Set<OrderDetail> orderDetails = response.getOrderDetails().stream().map(detailRes -> {
                OrderDetail orderDetail = new OrderDetail();
                Product product = new Product();
                product.setProductId(detailRes.getProductId());
                product.setName(detailRes.getProductName());

                orderDetail.setProduct(product);
                orderDetail.setQuantity(detailRes.getQuantity());
                orderDetail.setPriceAtPurchase(detailRes.getPrice());
                orderDetail.setOrder(order);
                return orderDetail;
            }).collect(Collectors.toSet());
            order.setOrderDetails(orderDetails);
        }
        return order;
    }
}
