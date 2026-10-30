package com.hometutorfinder.service;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.hometutorfinder.exception.ApiException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.Map;

@Component
public class RazorpayGateway {
    private static final Logger log = LoggerFactory.getLogger(RazorpayGateway.class);
    private final RestClient client;
    private final String keyId;
    private final String keySecret;

    public RazorpayGateway(
            RestClient.Builder builder,
            @Value("${app.razorpay.key-id:}") String keyId,
            @Value("${app.razorpay.key-secret:}") String keySecret) {
        this.keyId = keyId;
        this.keySecret = keySecret;
        this.client = builder
                .baseUrl("https://api.razorpay.com/v1")
                .defaultHeaders(headers -> headers.setBasicAuth(keyId, keySecret))
                .build();
    }

    public String getKeyId() {
        requireConfigured();
        return keyId;
    }

    public Order createOrder(long amountPaise, long requestId) {
        requireConfigured();
        try {
            Order order = client.post()
                    .uri("/orders")
                    .body(Map.of(
                            "amount", amountPaise,
                            "currency", "INR",
                            "receipt", "tutor-request-" + requestId,
                            "notes", Map.of("tutoring_request_id", Long.toString(requestId))))
                    .retrieve()
                    .body(Order.class);
            if (order == null || order.id() == null || order.amount() == null || order.currency() == null) {
                throw ApiException.badGateway("Razorpay returned an invalid order response.");
            }
            return order;
        } catch (RestClientResponseException e) {
            log.warn("Razorpay order API returned HTTP {}", e.getStatusCode());
            throw ApiException.badGateway("Razorpay could not create the payment order. Please try again.");
        } catch (RestClientException e) {
            log.warn("Razorpay order API request failed", e);
            throw ApiException.badGateway("Razorpay could not be reached. Please try again.");
        }
    }

    public PaymentDetails fetchPayment(String paymentId) {
        requireConfigured();
        try {
            PaymentDetails payment = client.get()
                    .uri("/payments/{paymentId}", paymentId)
                    .retrieve()
                    .body(PaymentDetails.class);
            if (payment == null || payment.id() == null || payment.orderId() == null
                    || payment.amount() == null || payment.currency() == null || payment.status() == null) {
                throw ApiException.badGateway("Razorpay returned an invalid payment response.");
            }
            return payment;
        } catch (RestClientResponseException e) {
            log.warn("Razorpay payment API returned HTTP {}", e.getStatusCode());
            throw ApiException.badGateway("Razorpay could not verify the payment. Please try again.");
        } catch (RestClientException e) {
            log.warn("Razorpay payment API request failed", e);
            throw ApiException.badGateway("Razorpay could not be reached. Please try again.");
        }
    }

    public boolean isValidSignature(String orderId, String paymentId, String signature) {
        requireConfigured();
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(keySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] expected = mac.doFinal((orderId + "|" + paymentId).getBytes(StandardCharsets.UTF_8));
            byte[] supplied = HexFormat.of().parseHex(signature);
            return MessageDigest.isEqual(expected, supplied);
        } catch (IllegalArgumentException e) {
            return false;
        } catch (java.security.GeneralSecurityException e) {
            throw new IllegalStateException("HMAC-SHA256 is unavailable", e);
        }
    }

    private void requireConfigured() {
        if (keyId.isBlank() || keySecret.isBlank()) {
            throw ApiException.serviceUnavailable("Razorpay payments are not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in the backend environment.");
        }
    }

    public record Order(String id, Long amount, String currency) {}

    public record PaymentDetails(
            String id,
            @JsonProperty("order_id") String orderId,
            Long amount,
            String currency,
            String status) {}
}
