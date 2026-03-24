package com.sba301.code.be.model.enums;

public enum OrderStatus {
    PENDING, // Chờ xử lý
    CONFIRMED, // Đã xác nhận
    SHIPPING, // Đang giao
    DELIVERED, // Đã giao
    COMPLETED, // Khách xác nhận đã nhận hàng
    DEFAULTED, // Mất khả năng thanh toán (hợp đồng trả góp)
    CANCELLED // Đã hủy
}
