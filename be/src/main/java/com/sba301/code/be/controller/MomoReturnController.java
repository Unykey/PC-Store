package com.sba301.code.be.controller;

import com.sba301.code.be.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;

@RestController
@RequestMapping("/payment/momo")
@RequiredArgsConstructor
public class MomoReturnController {

    private final PaymentService paymentService;

    @GetMapping("/return")
    public ResponseEntity<Void> momoReturn(@RequestParam("orderId") String orderId) {
        String redirectUrl = paymentService.handleMomoReturnAndGetRedirectUrl(orderId);
        HttpHeaders headers = new HttpHeaders();
        headers.setLocation(URI.create(redirectUrl));
        return new ResponseEntity<>(headers, HttpStatus.FOUND);
    }
}
