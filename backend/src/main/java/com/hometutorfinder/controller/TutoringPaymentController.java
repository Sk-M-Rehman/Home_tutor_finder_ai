package com.hometutorfinder.controller;

import com.hometutorfinder.dto.Dtos.PaymentOrderResponse;
import com.hometutorfinder.dto.Dtos.PaymentResponse;
import com.hometutorfinder.dto.Dtos.PaymentVerificationRequest;
import com.hometutorfinder.security.CurrentUser;
import com.hometutorfinder.service.TutoringPaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/requests/{requestId}/payment")
@RequiredArgsConstructor
public class TutoringPaymentController {
    private final TutoringPaymentService service;

    @PostMapping("/order")
    public PaymentOrderResponse createOrder(
            @AuthenticationPrincipal CurrentUser me,
            @PathVariable Long requestId) {
        return service.createOrder(me, requestId);
    }

    @PostMapping("/verify")
    public PaymentResponse verify(
            @AuthenticationPrincipal CurrentUser me,
            @PathVariable Long requestId,
            @Valid @RequestBody PaymentVerificationRequest verification) {
        return service.verify(me, requestId, verification);
    }
}
