package com.hometutorfinder.controller;

import com.hometutorfinder.dto.Dtos.*;
import com.hometutorfinder.security.CurrentUser;
import com.hometutorfinder.service.TutoringRequestService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/requests")
@RequiredArgsConstructor
@Tag(name = "Tutoring requests")
public class TutoringRequestController {
    private final TutoringRequestService service;

    @Operation(summary = "STUDENT: send a request to a tutor (status PENDING)")
    @PostMapping
    public ResponseEntity<RequestResponse> create(@AuthenticationPrincipal CurrentUser me, @Valid @RequestBody TutoringRequestCreate r) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(me, r));
    }

    @Operation(summary = "STUDENT: my requests")
    @GetMapping("/student/me")
    public List<RequestResponse> student(@AuthenticationPrincipal CurrentUser me) { return service.forStudent(me); }

    @Operation(summary = "TUTOR: requests addressed to me")
    @GetMapping("/tutor/me")
    public List<RequestResponse> tutor(@AuthenticationPrincipal CurrentUser me) { return service.forTutor(me); }

    @Operation(summary = "TUTOR: accept or reject a PENDING request")
    @PatchMapping("/{id}/status")
    public RequestResponse status(@AuthenticationPrincipal CurrentUser me, @PathVariable Long id, @Valid @RequestBody StatusUpdateRequest r) {
        return service.updateStatus(me, id, r.status());
    }

    @Operation(summary = "STUDENT: cancel my PENDING or ACCEPTED request")
    @PatchMapping("/{id}/cancel")
    public RequestResponse cancel(@AuthenticationPrincipal CurrentUser me, @PathVariable Long id) {
        return service.cancel(me, id);
    }
}
