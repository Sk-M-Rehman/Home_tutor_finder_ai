package com.hometutorfinder.controller;

import com.hometutorfinder.dto.Dtos.*;
import com.hometutorfinder.security.CurrentUser;
import com.hometutorfinder.service.TutorService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tutors")
@RequiredArgsConstructor
@Tag(name = "Tutor availability")
public class AvailabilityController {
    private final TutorService service;

    @GetMapping("/{id}/availability")
    public List<AvailabilityResponse> forTutor(@PathVariable Long id) { return service.availabilityOf(id); }

    @GetMapping("/me/availability")
    public List<AvailabilityResponse> mine(@AuthenticationPrincipal CurrentUser me) { return service.myAvailability(me.id()); }

    @PostMapping("/me/availability")
    public ResponseEntity<AvailabilityResponse> add(@AuthenticationPrincipal CurrentUser me, @Valid @RequestBody AvailabilityRequest r) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.addAvailability(me.id(), r));
    }

    @PutMapping("/me/availability/{availabilityId}")
    public AvailabilityResponse update(@AuthenticationPrincipal CurrentUser me, @PathVariable Long availabilityId,
                                       @Valid @RequestBody AvailabilityRequest r) {
        return service.updateAvailability(me.id(), availabilityId, r);
    }

    @DeleteMapping("/me/availability/{availabilityId}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal CurrentUser me, @PathVariable Long availabilityId) {
        service.deleteAvailability(me.id(), availabilityId);
        return ResponseEntity.noContent().build();
    }
}
