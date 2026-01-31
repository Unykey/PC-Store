package com.sba301.code.be.exception;

import com.sba301.code.be.dto.response.ApiResponse; // Import ApiResponse của bạn
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {
    // 1. Logic errors (RuntimeException)
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiResponse<Object>> handleRuntimeException(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(400, ex.getMessage()));
    }

    // 2. Other errors (Lỗi code, NullPointer...)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleUnwantedException(Exception ex) {
        ex.printStackTrace();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error(500, "Error System: " + ex.getMessage()));
    }
}
