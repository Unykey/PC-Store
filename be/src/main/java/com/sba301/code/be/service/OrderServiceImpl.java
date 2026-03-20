package com.sba301.code.be.service;

import com.sba301.code.be.dto.request.OrderCreateRequest;
import com.sba301.code.be.dto.request.OrderItemRequest;
import com.sba301.code.be.dto.response.InstallmentResponse;
import com.sba301.code.be.dto.response.OrderDetailResponse;
import com.sba301.code.be.dto.response.OrderResponse;
import com.sba301.code.be.model.entity.*;
import com.sba301.code.be.model.enums.InstallmentProvider;
import com.sba301.code.be.model.enums.InstallmentStatus;
import com.sba301.code.be.model.enums.OrderStatus;
import com.sba301.code.be.model.enums.PaymentTransactionStatus;
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
    private final PaymentSettingsService paymentSettingsService;
    private final PaymentTransactionRepository paymentTransactionRepository;

    private static final List<Integer> ALLOWED_INSTALLMENT_MONTHS = List.of(3, 6, 12, 24);

    @Override
    @Transactional(rollbackFor = Exception.class)
    public OrderResponse placeOrder(OrderCreateRequest request) {
        // 1. Validate installment parameters early
        if (request.getPaymentType() == PaymentType.INSTALLMENT) {
            if (request.getInstallmentMonths() == null) {
                throw new IllegalArgumentException(
                        "installmentMonths is required for installment orders.");
            }
            if (!ALLOWED_INSTALLMENT_MONTHS.contains(request.getInstallmentMonths())) {
                throw new IllegalArgumentException("installmentMonths must be one of: " + ALLOWED_INSTALLMENT_MONTHS);
            }
            if (request.getInstallmentProvider() != null
                    && request.getInstallmentProvider() != InstallmentProvider.MOMO) {
                throw new IllegalArgumentException("Only MOMO installment provider is supported in this project");
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
        order.setShippingAddress(request.getShippingAddress());
        order.setNote(request.getNote());

        if (order.getPaymentType() == PaymentType.INSTALLMENT) {
            order.setInstallmentMonths(request.getInstallmentMonths());
            order.setInstallmentProvider(InstallmentProvider.MOMO);
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
        PaymentSettings settings = paymentSettingsService.getOrCreateSettings();
        BigDecimal monthlyPrincipal = order.getTotalAmount()
                .divide(BigDecimal.valueOf(months), 2, RoundingMode.HALF_UP);
        BigDecimal monthlyInterest = order.getTotalAmount()
                .multiply(settings.getMonthlyInstallmentRate())
                .setScale(2, RoundingMode.HALF_UP);

        LocalDate startDate = order.getOrderDate().toLocalDate();
        List<Installment> schedule = new ArrayList<>();
        BigDecimal distributedPrincipal = BigDecimal.ZERO;

        for (int month = 1; month <= months; month++) {
            Installment installment = new Installment();
            installment.setOrder(order);
            installment.setMonthNumber(month);

            BigDecimal principal = month == months
                    ? order.getTotalAmount().subtract(distributedPrincipal)
                    : monthlyPrincipal;
            distributedPrincipal = distributedPrincipal.add(principal);

            installment.setPrincipalAmount(principal);
            installment.setInterestAmount(monthlyInterest);
            installment.setOverdueFee(BigDecimal.ZERO);
            installment.setAmount(principal.add(monthlyInterest));
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

        if (!order.getAccount().getAccountId().equals(accountId)) {
            throw new RuntimeException("Bạn không có quyền hủy đơn hàng này");
        }

        if (order.getOrderStatus() != OrderStatus.PENDING) {
            throw new RuntimeException("Đơn hàng đã được duyệt hoặc đang giao, không thể hủy!");
        }

        order.setOrderStatus(OrderStatus.CANCELLED);

        for (OrderDetail detail : order.getOrderDetails()) {
            Product p = detail.getProduct();
            p.setStockQuantity(p.getStockQuantity() + detail.getQuantity());
            productRepository.save(p);
        }

        return mapToResponse(orderRepository.save(order));
    }

    @Override
    public OrderResponse confirmReceived(Long orderId, Long accountId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        if (!order.getAccount().getAccountId().equals(accountId)) {
            throw new RuntimeException("Bạn không có quyền xác nhận đơn hàng này");
        }

        if (order.getOrderStatus() != OrderStatus.DELIVERED) {
            throw new RuntimeException("Chỉ có thể xác nhận khi đơn hàng ở trạng thái DELIVERED");
        }

        if (!isOrderFullyPaid(order)) {
            throw new RuntimeException("Đơn hàng chưa thanh toán đầy đủ, không thể hoàn tất");
        }

        order.setOrderStatus(OrderStatus.COMPLETED);
        return mapToResponse(orderRepository.save(order));
    }

    private boolean isOrderFullyPaid(Order order) {
        if (order.getPaymentType() == PaymentType.INSTALLMENT) {
            return installmentRepository.countByOrder_OrderIdAndInstallmentStatusNot(
                    order.getOrderId(), InstallmentStatus.PAID) == 0;
        }

        return paymentTransactionRepository.existsByOrder_OrderIdAndInstallmentIsNullAndStatus(
                order.getOrderId(), PaymentTransactionStatus.SUCCESS);
    }

    private OrderResponse mapToResponse(Order order) {
        OrderResponse response = new OrderResponse();
        response.setOrderId(order.getOrderId());
        response.setOrderDate(order.getOrderDate());
        response.setOrderStatus(order.getOrderStatus());
        response.setTotalAmount(order.getTotalAmount());
        response.setPaymentType(order.getPaymentType());
        response.setShippingAddress(order.getShippingAddress());
        response.setNote(order.getNote());

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
                            ir.setPrincipalAmount(i.getPrincipalAmount());
                            ir.setInterestAmount(i.getInterestAmount());
                            ir.setOverdueFee(i.getOverdueFee());
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
}
