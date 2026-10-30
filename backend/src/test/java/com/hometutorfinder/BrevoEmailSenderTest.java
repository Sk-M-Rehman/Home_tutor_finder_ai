package com.hometutorfinder;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hometutorfinder.service.BrevoEmailSender;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.mock.http.client.MockClientHttpResponse;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.util.concurrent.atomic.AtomicBoolean;

import static org.junit.jupiter.api.Assertions.*;

class BrevoEmailSenderTest {
    @Test
    void sendsEmailOverHttpsWithApiAuthentication() {
        AtomicBoolean called = new AtomicBoolean();
        RestClient.Builder builder = RestClient.builder().requestInterceptor((request, body, execution) -> {
            called.set(true);
            assertEquals("https://api.brevo.com/v3/smtp/email", request.getURI().toString());
            assertEquals("test-key", request.getHeaders().getFirst("api-key"));
            var json = new ObjectMapper().readTree(body);
            assertEquals("sender@example.com", json.at("/sender/email").asText());
            assertEquals("student@example.com", json.at("/to/0/email").asText());
            assertEquals("Welcome", json.get("subject").asText());
            assertEquals("Hello", json.get("textContent").asText());
            return new MockClientHttpResponse(new byte[0], HttpStatus.CREATED);
        });
        new BrevoEmailSender(builder, "test-key").send("sender@example.com", "student@example.com", "Welcome", "Hello");
        assertTrue(called.get());
    }

    @Test
    void rejectsMissingCredentialsWithoutNetworkCall() {
        var sender = new BrevoEmailSender(RestClient.builder(), "");
        assertThrows(IllegalStateException.class,
                () -> sender.send("sender@example.com", "student@example.com", "Welcome", "Hello"));
    }

    @Test
    void reportsProviderRejectionRatherThanClaimingSuccess() {
        var builder = RestClient.builder().requestInterceptor((request, body, execution) ->
                new MockClientHttpResponse(new byte[0], HttpStatus.UNAUTHORIZED));
        var sender = new BrevoEmailSender(builder, "invalid-test-key");
        assertThrows(RestClientResponseException.class,
                () -> sender.send("sender@example.com", "student@example.com", "Welcome", "Hello"));
    }
}
