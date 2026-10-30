package com.hometutorfinder.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.hometutorfinder.exception.ApiException;
import org.springframework.beans.factory.annotation.Value;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class GeminiChatService {
    private static final Logger log = LoggerFactory.getLogger(GeminiChatService.class);
    private final String apiKey;
    private final String model;
    private final RestClient restClient;

    public GeminiChatService(@Value("${app.gemini.api-key:}") String apiKey,
                             @Value("${app.gemini.model:gemini-2.5-flash}") String model) {
        this.apiKey = apiKey == null ? "" : apiKey.trim();
        this.model = model;
        this.restClient = RestClient.builder().baseUrl("https://generativelanguage.googleapis.com").build();
    }

    public String answer(String message, String history) {
        if (apiKey.isBlank()) {
            throw ApiException.serviceUnavailable("Gemini is not configured. Add GEMINI_API_KEY to backend/.env and restart the backend.");
        }

        String prompt = """
                You are Tutor AI for Home Tutor Finder, an Indian home and online tutoring marketplace.
                Help students find tutors and help tutors understand registration, availability, slot booking, payments, and notifications.
                Be concise, friendly, and practical. Do not invent tutor availability, prices, payment status, or personal data.
                If the user asks for a tutor, ask for subject and city when missing and suggest using the tutor search page.
                Conversation so far:
                %s
                User's latest message:
                %s
                """.formatted(history == null ? "" : history, message);

        try {
            Map<String, Object> body = Map.of(
                    "contents", List.of(Map.of("parts", List.of(Map.of("text", prompt)))));
            JsonNode response = restClient.post()
                    .uri(uriBuilder -> uriBuilder.path("/v1beta/models/{model}:generateContent")
                            .queryParam("key", apiKey).build(model))
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(JsonNode.class);
            String answer = response == null ? "" : response.path("candidates").path(0)
                    .path("content").path("parts").path(0).path("text").asText("");
            return answer == null || answer.isBlank() ? "I could not generate a response. Please try again." : answer.trim();
        } catch (RuntimeException ex) {
            log.warn("Gemini request failed: {}", ex.getMessage());
            throw ApiException.badGateway("Gemini could not answer right now. Please try again.");
        }
    }
}
