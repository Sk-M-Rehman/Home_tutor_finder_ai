package com.hometutorfinder.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Component
public class BrevoEmailSender {
    private final RestClient client;
    private final String apiKey;

    public BrevoEmailSender(RestClient.Builder builder,
                            @Value("${app.mail.brevo-api-key:}") String apiKey) {
        this.apiKey = apiKey;
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000);
        factory.setReadTimeout(10000);
        this.client = builder.baseUrl("https://api.brevo.com/v3")
                .requestFactory(factory).build();
    }

    public void send(String from, String recipient, String subject, String text) {
        if (apiKey.isBlank() || from.isBlank()) {
            throw new IllegalStateException("Brevo requires BREVO_API_KEY and a verified MAIL_FROM sender");
        }
        client.post().uri("/smtp/email")
                .header("api-key", apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of("sender", Map.of("email", from, "name", "Home Tutor Finder"),
                        "to", List.of(Map.of("email", recipient)),
                        "subject", subject, "textContent", text))
                .retrieve().toBodilessEntity();
    }
}
