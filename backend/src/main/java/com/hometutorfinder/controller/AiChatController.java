package com.hometutorfinder.controller;

import com.hometutorfinder.service.GeminiChatService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiChatController {
    private final GeminiChatService gemini;

    @PostMapping("/chat")
    public ChatResponse chat(@Valid @RequestBody ChatRequest request) {
        return new ChatResponse(gemini.answer(request.message(), request.history()));
    }

    public record ChatRequest(
            @NotBlank @Size(max = 2000) String message,
            @Size(max = 12000) String history) {}

    public record ChatResponse(String answer) {}
}
