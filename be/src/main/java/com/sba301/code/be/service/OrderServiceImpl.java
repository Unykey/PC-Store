package com.sba301.code.be.service;

import com.sba301.code.be.dto.request.OrderCreateRequest;
import com.sba301.code.be.dto.request.OrderItemRequest;
import com.sba301.code.be.dto.response.InstallmentResponse;
import com.sba301.code.be.dto.response.OrderDetailResponse;
import com.sba301.code.be.dto.response.OrderResponse;
import com.sba301.code.be.model.entity.*;
import com.sba301.code.be.model.enums.InstallmentStatus;
import com.sba301.code.be.model.enums.OrderStatus;
import com.sba301.code.be.model.enums.PaymentType;
import com.sba301.code.be.repository.*;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@AllArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final AccountRepository accountRepository;
    private final ProductRepository productRepository;
    private final InstallmentRepository installmentRepository;

    private static final List<Integer> ALLOWED_INSTALLMENT_MONTHS = List.of(3, 6, 12, 24);

    @Override
    @Transactional(rollbackFor = Exception.class)
    public OrderResponse placeOrder(OrderCreateRequest request) {
        // 1. Validate installment parameters early
        if (request.getPaymentType() == PaymentType.INSTALLMENT) {
            if (request.getInstallmentMonths() == null || request.getInstallmentProvider() == null) {
                throw new IllegalArgumentException(
                        "installmentMonths and installmentProvider are required for installment orders.");
            }
            if (!ALLOWED_INSTALLMENT_MONTHS.contains(request.getInstallmentMonths())) {
                throw new IllegalArgumentException("installmentMonths must be one of: " + ALLOWED_INSTALLMENT_MONTHS);
            }
        }

        // 2. Find buyer
        Account account = accountRepository.findById(request.getAccountId())
                .orElseThrow(() -> new RuntimeException("Account not found with ID: " + request.getAccountId()));

        // 3. Build Order
        Order order = new Order();
        order.setAccount(account);
        order.setOrderDate(LocalDateTime.now());
        order.setOrderStatus(OrderStatus.PENDING);
        order.setPaymentType(request.getPaymentType() != null ? request.getPaymentType() : PaymentType.FULL_PAYMENT);

        if (order.getPaymentType() == PaymentType.INSTALLMENT) {
            order.setInstallmentMonths(request.getInstallmentMonths());
            order.setInstallmentProvider(request.getInstallmentProvider());
        }

        BigDecimal totalAmount = BigDecimal.ZERO;
        Set<OrderDetail> orderDetails = new HashSet<>();

        // 4. Process each cart item
        for (OrderItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found with ID: " + itemReq.getProductId()));

            if (product.getStockQuantity() < itemReq.getQuantity()) {
                throw new RuntimeException("Product '" + product.getName() + "' is out of stock (available: "
                        + product.getStockQuantity() + ")");
            }

            product.setStockQuantity(product.getStockQuantity() - itemReq.getQuantity());
            productRepository.save(product);

            OrderDetail detail = new OrderDetail();
            detail.setOrder(order);
            detail.setProduct(product);
            detail.setQuantity(itemReq.getQuantity());
            detail.setPriceAtPurchase(product.getPrice());

            totalAmount = totalAmount.add(product.getPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity())));
            orderDetails.add(detail);
        }

        order.setTotalAmount(totalAmount);
        order.setOrderDetails(orderDetails);

        // 5. Save order (cascades to OrderDetail)
        Order savedOrder = orderRepository.save(order);

        // 6. Generate installment schedule if applicable
        if (savedOrder.getPaymentType() == PaymentType.INSTALLMENT) {
            generateInstallmentSchedule(savedOrder);
        }

        return mapToResponse(savedOrder);
    }

    /**
     * Creates one Installment record per month, distributed evenly from the order
     * date.
     */
    private void generateInstallmentSchedule(Order order) {
        int months = order.getInstallmentMonths();
        BigDecimal monthlyAmount = order.getTotalAmount()
                .divide(BigDecimal.valueOf(months), 0, RoundingMode.CEILING);

        LocalDate startDate = order.getOrderDate().toLocalDate();
        List<Installment> schedule = new ArrayList<>();

        for (int month = 1; month <= months; month++) {
            Installment installment = new Installment();
            installment.setOrder(order);
            installment.setMonthNumber(month);
            installment.setAmount(monthlyAmount);
            installment.setDueDate(startDate.plusMonths(month));
            installment.setInstallmentStatus(InstallmentStatus.PENDING);
            schedule.add(installment);
        }

        installmentRepository.saveAll(schedule);
        order.getInstallments().addAll(schedule);
    }

    @Override
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll().stream().map(this::mapToResponse).toList();
    }

    @Override
    public OrderResponse getOrderById(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));
        return mapToResponse(order);
    }

    @Override
    public List<OrderResponse> getOrdersByAccountId(Long accountId) {
        return orderRepository.findByAccount_AccountId(accountId)
                .stream().map(this::mapToResponse).toList();
    }

    @Override
    public OrderResponse updateOrderStatus(Long orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));
        order.setOrderStatus(status);
        return mapToResponse(orderRepository.save(order));
    }

    @Override
    public OrderResponse cancelOrder(Long orderId, Long accountId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

<<<<<<< Updated upstream
        // 1. Check quyền: Phải đúng là đơn của người này
=======
>>>>>>> Stashed changes
        if (!order.getAccount().getAccountId().equals(accountId)) {
            throw new RuntimeException("Bạn không có quyền hủy đơn hàng này");
        }

<<<<<<< Updated upstream
        // 2. Check trạng thái: Chỉ được hủy khi đang chờ (PENDING)
=======
>>>>>>> Stashed changes
        if (order.getOrderStatus() != OrderStatus.PENDING) {
            throw new RuntimeException("Đơn hàng đã được duyệt hoặc đang giao, không thể hủy!");
        }

<<<<<<< Updated upstream
        // 3. Thực hiện hủy
        order.setOrderStatus(OrderStatus.CANCELLED);

        // 4. (Quan trọng) Hoàn lại số lượng tồn kho cho sản phẩm
=======
        order.setOrderStatus(OrderStatus.CANCELLED);

>>>>>>> Stashed changes
        for (OrderDetail detail : order.getOrderDetails()) {
            Product p = detail.getProduct();
            p.setStockQuantity(p.getStockQuantity() + detail.getQuantity());
            productRepository.save(p);
        }

<<<<<<< Updated upstream
        Order saved = orderRepository.save(order);
        return mapToResponse(saved);
=======
        return mapToResponse(orderRepository.save(order));
>>>>>>> Stashed changes
    }

    private OrderResponse mapToResponse(Order order) {
        OrderResponse response = new OrderResponse();
        response.setOrderId(order.getOrderId());
        response.setOrderDate(order.getOrderDate());
        response.setOrderStatus(order.getOrderStatus());
        response.setTotalAmount(order.getTotalAmount());
        response.setPaymentType(order.getPaymentType());

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

        if (order.getPaymentType() == PaymentType.INSTALLMENT) {
            response.setInstallmentMonths(order.getInstallmentMonths());
            response.setInstallmentProvider(order.getInstallmentProvider());

            if (order.getInstallmentMonths() != null && order.getTotalAmount() != null) {
                response.setMonthlyAmount(order.getTotalAmount()
                        .divide(BigDecimal.valueOf(order.getInstallmentMonths()), 0, RoundingMode.CEILING));
            }

            if (order.getInstallments() != null && !order.getInstallments().isEmpty()) {
                List<InstallmentResponse> installmentResponses = order.getInstallments().stream()
                        .sorted((a, b) -> Integer.compare(a.getMonthNumber(), b.getMonthNumber()))
                        .map(i -> {
                            InstallmentResponse ir = new InstallmentResponse();
                            ir.setId(i.getId());
                            ir.setOrderId(order.getOrderId());
                            ir.setProvider(order.getInstallmentProvider());
                            ir.setTotalMonths(order.getInstallmentMonths());
                            ir.setMonthNumber(i.getMonthNumber());
                            ir.setAmount(i.getAmount());
                            ir.setDueDate(i.getDueDate());
                            ir.setPaidDate(i.getPaidDate());
                            ir.setInstallmentStatus(i.getInstallmentStatus());
                            return ir;
                        }).toList();
                response.setInstallments(installmentResponses);
            }
        }

        return response;
    }
<<<<<<< Updated upstream

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
=======
>>>>>>> Stashed changes
}
