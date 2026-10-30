package com.hometutorfinder;

import com.hometutorfinder.service.RazorpayGateway;
import org.junit.jupiter.api.Test;
import org.springframework.web.client.RestClient;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;

import static org.junit.jupiter.api.Assertions.*;

class RazorpayGatewayTest {
    @Test
    void verifiesRazorpayHmacSignature() throws Exception {
        String secret = "test-secret-for-hmac-verification";
        String orderId = "order_test123";
        String paymentId = "pay_test456";
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        String signature = HexFormat.of().formatHex(
                mac.doFinal((orderId + "|" + paymentId).getBytes(StandardCharsets.UTF_8)));

        RazorpayGateway gateway = new RazorpayGateway(RestClient.builder(), "rzp_test_key", secret);

        assertTrue(gateway.isValidSignature(orderId, paymentId, signature));
        assertFalse(gateway.isValidSignature(orderId, paymentId, "invalid"));
        assertFalse(gateway.isValidSignature(orderId, paymentId, signature + "00"));
    }
}
