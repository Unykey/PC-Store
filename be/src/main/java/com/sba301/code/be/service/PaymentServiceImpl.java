package com.sba301.code.be.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sba301.code.be.dto.request.CashPaymentRequest;
import com.sba301.code.be.dto.request.MomoCreatePaymentRequest;
import com.sba301.code.be.dto.request.MomoIpnRequest;
import com.sba301.code.be.dto.response.CashPaymentResponse;
import com.sba301.code.be.dto.response.MomoCreatePaymentResponse;
import com.sba301.code.be.model.entity.Installment;
import com.sba301.code.be.model.entity.Order;
import com.sba301.code.be.model.entity.PaymentTransaction;
import com.sba301.code.be.model.enums.InstallmentStatus;
import com.sba301.code.be.model.enums.OrderStatus;
import com.sba301.code.be.model.enums.PaymentTransactionStatus;
import com.sba301.code.be.model.enums.PaymentType;
import com.sba301.code.be.repository.InstallmentRepository;
import com.sba301.code.be.repository.OrderRepository;
import com.sba301.code.be.repository.PaymentTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final OrderRepository orderRepository;
    private final InstallmentRepository installmentRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${app.momo.partner-code:MOMO}")
    private String partnerCode;

    @Value("${app.momo.access-key:test-access-key}")
    private String accessKey;

    @Value("${app.momo.secret-key:test-secret-key}")
    private String secretKey;

    @Value("${app.momo.endpoint:https://test-payment.momo.vn/v2/gateway/api/create}")
    private String momoEndpoint;

    @Value("${app.momo.redirect-url:http://localhost:5173/checkout/result}")
    private String redirectUrl;

    @Value("${app.momo.ipn-url:http://localhost:8080/api/payments/momo/ipn}")
    private String ipnUrl;

    @Override
    @Transactional
    public CashPaymentResponse payWithCash(CashPaymentRequest request, Long accountId) {
        if (request.getOrderId() == null) {
            throw new IllegalArgumentException("orderId is required");
        }

        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + request.getOrderId()));

        if (!Objects.equals(order.getAccount().getAccountId(), accountId)) {
            throw new RuntimeException("You cannot pay an order that does not belong to you");
        }

        if (order.getPaymentType() == PaymentType.INSTALLMENT) {
            throw new IllegalArgumentException("Cash payment endpoint is only for non-installment orders");
        }

        if (order.getOrderStatus() == OrderStatus.CANCELLED
                || order.getOrderStatus() == OrderStatus.COMPLETED
                || order.getOrderStatus() == OrderStatus.DEFAULTED) {
            throw new RuntimeException("Order is not payable");
        }

        if (paymentTransactionRepository.existsByOrder_OrderIdAndInstallmentIsNullAndStatus(
                order.getOrderId(), PaymentTransactionStatus.SUCCESS)) {
            throw new IllegalStateException("Order is already paid");
        }

        String requestId = "CASH-" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
        String orderCode = "CASH-ORDER-" + order.getOrderId();

        PaymentTransaction tx = new PaymentTransaction();
        tx.setOrder(order);
        tx.setInstallment(null);
        tx.setRequestId(requestId);
        tx.setOrderCode(orderCode);
        tx.setAmount(order.getTotalAmount());
        tx.setPaymentMethod("CASH");
        tx.setResultCode(0);
        tx.setMessage(request.getNote() == null || request.getNote().isBlank()
                ? "Paid by cash (demo)"
                : request.getNote());
        tx.setStatus(PaymentTransactionStatus.SUCCESS);
        tx.setSignatureValid(true);
        tx.setPaidAt(LocalDateTime.now());
        tx.setRawPayload(writeJsonSafe(Map.of(
                "paymentMethod", "CASH",
                "orderId", order.getOrderId(),
                "note", tx.getMessage())));

        paymentTransactionRepository.save(tx);

        if (order.getOrderStatus() == OrderStatus.PENDING) {
            order.setOrderStatus(OrderStatus.CONFIRMED);
            orderRepository.save(order);
        }

        return new CashPaymentResponse(requestId, orderCode, "SUCCESS", tx.getMessage());
    }

    @Override
    @Transactional
    public MomoCreatePaymentResponse createMomoPayment(MomoCreatePaymentRequest request, Long accountId) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + request.getOrderId()));

        if (!Objects.equals(order.getAccount().getAccountId(), accountId)) {
            throw new RuntimeException("You cannot pay an order that does not belong to you");
        }

        if (order.getOrderStatus() == OrderStatus.CANCELLED
                || order.getOrderStatus() == OrderStatus.COMPLETED
                || order.getOrderStatus() == OrderStatus.DEFAULTED) {
            throw new RuntimeException("Order is not payable");
        }

        Installment installment = null;
        Long selectedInstallmentId = request.getInstallmentId();
        BigDecimal amount;

        if (order.getPaymentType() == PaymentType.INSTALLMENT) {
            if (selectedInstallmentId == null) {
                installment = installmentRepository.findByOrder_OrderId(order.getOrderId()).stream()
                        .filter(i -> i.getInstallmentStatus() != InstallmentStatus.PAID)
                        .min(Comparator.comparingInt(Installment::getMonthNumber))
                        .orElseThrow(() -> new IllegalStateException("No unpaid installment found for this order"));
                selectedInstallmentId = installment.getId();
            }

            if (installment == null) {
                Optional<Installment> installmentOptional = installmentRepository.findById(selectedInstallmentId);
                if (installmentOptional.isEmpty()) {
                    throw new RuntimeException("Installment not found with ID: " + selectedInstallmentId);
                }
                installment = installmentOptional.get();
            }

            if (!Objects.equals(installment.getOrder().getOrderId(), order.getOrderId())) {
                throw new IllegalArgumentException("installmentId does not belong to this order");
            }

            if (installment.getInstallmentStatus() == InstallmentStatus.PAID) {
                throw new IllegalStateException("Installment is already paid");
            }

            amount = installment.getAmount();
        } else {
            amount = order.getTotalAmount();
        }

        String requestId = UUID.randomUUID().toString().replace("-", "");
        String orderCode = buildOrderCode(order.getOrderId(), selectedInstallmentId, requestId);
        String orderInfo = request.getOrderInfo() != null && !request.getOrderInfo().isBlank()
                ? request.getOrderInfo()
                : "Thanh toan don hang PCStore #" + order.getOrderId();

        String amountText = amount.setScale(0, java.math.RoundingMode.HALF_UP).toPlainString();
        String extraData = selectedInstallmentId == null ? "" : "installmentId=" + selectedInstallmentId;
        String requestType = "captureWallet";

        String rawSignature = "accessKey=" + accessKey
                + "&amount=" + amountText
                + "&extraData=" + extraData
                + "&ipnUrl=" + ipnUrl
                + "&orderId=" + orderCode
                + "&orderInfo=" + orderInfo
                + "&partnerCode=" + partnerCode
                + "&redirectUrl=" + redirectUrl
                + "&requestId=" + requestId
                + "&requestType=" + requestType;

        String signature = hmacSha256(rawSignature, secretKey);

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("partnerCode", partnerCode);
        payload.put("requestId", requestId);
        payload.put("amount", amountText);
        payload.put("orderId", orderCode);
        payload.put("orderInfo", orderInfo);
        payload.put("redirectUrl", redirectUrl);
        payload.put("ipnUrl", ipnUrl);
        payload.put("lang", "vi");
        payload.put("requestType", requestType);
        payload.put("extraData", extraData);
        payload.put("signature", signature);

        Map<String, Object> momoResponse = callMomoCreateApi(payload);

        PaymentTransaction tx = new PaymentTransaction();
        tx.setOrder(order);
        tx.setInstallment(installment);
        tx.setRequestId(requestId);
        tx.setOrderCode(orderCode);
        tx.setAmount(amount);
        tx.setPaymentMethod("MOMO");
        tx.setRawPayload(writeJsonSafe(payload));
        tx.setStatus(PaymentTransactionStatus.PENDING);

        Object resultCodeObj = momoResponse.getOrDefault("resultCode", -1);
        int resultCode = resultCodeObj instanceof Number n ? n.intValue() : -1;
        tx.setResultCode(resultCode);
        tx.setMessage((String) momoResponse.getOrDefault("message", "Payment initialized"));

        paymentTransactionRepository.save(tx);

        String payUrl = (String) momoResponse.getOrDefault("payUrl", redirectUrl + "?requestId=" + requestId);
        String deeplink = (String) momoResponse.getOrDefault("deeplink", "");
        String qrCodeUrl = (String) momoResponse.getOrDefault("qrCodeUrl", "");

        return new MomoCreatePaymentResponse(requestId, orderCode, payUrl, deeplink, qrCodeUrl);
    }

    @Override
    @Transactional
    public String handleMomoIpn(MomoIpnRequest request) {
        PaymentTransaction tx = paymentTransactionRepository.findByRequestId(request.getRequestId())
                .orElseGet(() -> paymentTransactionRepository.findByOrderCode(request.getOrderId())
                        .orElseThrow(() -> new RuntimeException("Transaction not found for requestId/orderId")));

        // MoMo IPN signature format (v2) requires these callback fields in fixed order.
        String rawSignature = "accessKey=" + accessKey
                + "&amount=" + nullSafeLong(request.getAmount())
                + "&extraData=" + nullSafe(request.getExtraData())
                + "&message=" + nullSafe(request.getMessage())
                + "&orderId=" + nullSafe(request.getOrderId())
                + "&orderInfo=" + nullSafe(request.getOrderInfo())
                + "&orderType=" + nullSafe(request.getOrderType())
                + "&partnerCode=" + nullSafe(request.getPartnerCode())
                + "&payType=" + nullSafe(request.getPayType())
                + "&requestId=" + nullSafe(request.getRequestId())
                + "&responseTime=" + nullSafeLong(request.getResponseTime())
                + "&resultCode=" + (request.getResultCode() == null ? -1 : request.getResultCode())
                + "&transId=" + nullSafeLong(request.getTransId());

        String expected = hmacSha256(rawSignature, secretKey);
        boolean signatureValid = expected.equalsIgnoreCase(nullSafe(request.getSignature()));

        tx.setRawPayload(writeJsonSafe(request));
        tx.setSignatureValid(signatureValid);
        tx.setResultCode(request.getResultCode() == null ? -1 : request.getResultCode());
        tx.setMessage(request.getMessage());
        tx.setMomoTransId(request.getTransId() == null ? null : String.valueOf(request.getTransId()));

        if (!signatureValid) {
            tx.setStatus(PaymentTransactionStatus.INVALID_SIGNATURE);
            paymentTransactionRepository.save(tx);
            return "INVALID_SIGNATURE";
        }

        if (request.getResultCode() != null && request.getResultCode() == 0) {
            tx.setStatus(PaymentTransactionStatus.SUCCESS);
            tx.setPaidAt(LocalDateTime.now());

            if (tx.getInstallment() != null) {
                Installment installment = tx.getInstallment();
                if (installment.getInstallmentStatus() != InstallmentStatus.PAID) {
                    installment.setInstallmentStatus(InstallmentStatus.PAID);
                    installment.setPaidDate(LocalDate.now());
                    installmentRepository.save(installment);
                }
            } else {
                Order order = tx.getOrder();
                if (order.getOrderStatus() == OrderStatus.PENDING) {
                    order.setOrderStatus(OrderStatus.CONFIRMED);
                    orderRepository.save(order);
                }
            }
        } else {
            tx.setStatus(PaymentTransactionStatus.FAILED);
        }

        paymentTransactionRepository.save(tx);
        return "OK";
    }

    private Map<String, Object> callMomoCreateApi(Map<String, Object> payload) {
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);
        try {
            ResponseEntity<Map> response = restTemplate.exchange(momoEndpoint, HttpMethod.POST, entity, Map.class);
            if (response.getBody() != null) {
                return response.getBody();
            }
        } catch (Exception ignored) {
            // Keep fallback response for local demo when sandbox API is unreachable.
        }

        Map<String, Object> fallback = new HashMap<>();
        fallback.put("resultCode", 0);
        fallback.put("message", "Sandbox fallback: generated local payUrl");
        fallback.put("payUrl",
                redirectUrl + "?requestId=" + payload.get("requestId") + "&orderId=" + payload.get("orderId"));
        return fallback;
    }

    private String buildOrderCode(Long orderId, Long installmentId, String requestId) {
        if (installmentId == null) {
            return "ORDER-" + orderId + "-" + requestId.substring(0, 8);
        }
        return "ORDER-" + orderId + "-INS-" + installmentId + "-" + requestId.substring(0, 8);
    }

    private String hmacSha256(String data, String key) {
        try {
            Mac hmac = Mac.getInstance("HmacSHA256");
            SecretKeySpec keySpec = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            hmac.init(keySpec);
            byte[] hash = hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(hash.length * 2);
            for (byte b : hash) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("Failed to sign MoMo payload", e);
        }
    }

    private String writeJsonSafe(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (JsonProcessingException e) {
            return "{}";
        }
    }

    private String nullSafe(String value) {
        return value == null ? "" : value;
    }

    private String nullSafeLong(Long value) {
        return value == null ? "0" : value.toString();
    }
}
