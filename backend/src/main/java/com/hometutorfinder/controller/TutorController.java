package com.hometutorfinder.controller;

import com.hometutorfinder.dto.Dtos.*;
import com.hometutorfinder.entity.TeachingMode;
import com.hometutorfinder.security.CurrentUser;
import com.hometutorfinder.service.TutorService;
import com.hometutorfinder.service.TutorService.SearchCriteria;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/tutors")
@RequiredArgsConstructor
@Validated
@Tag(name = "Tutors")
public class TutorController {
    private final TutorService service;

    @Operation(summary = "Search tutors (public). sort = hourlyFee|experienceYears|averageRating|createdAt , asc|desc")
    @GetMapping
    public PageResponse<TutorResponse> search(
            @RequestParam(required = false) String subject,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String locality,
            @RequestParam(required = false) @Min(0) BigDecimal minFee,
            @RequestParam(required = false) @Min(0) BigDecimal maxFee,
            @RequestParam(required = false) @Min(0) BigDecimal minRating,
            @RequestParam(required = false) TeachingMode teachingMode,
            @RequestParam(required = false) @Min(0) Integer minExperience,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "12") @Min(1) int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {
        return service.search(new SearchCriteria(subject, city, locality, minFee, maxFee, minRating, teachingMode, minExperience),
                page, size, sort);
    }

    @GetMapping("/featured")
    public List<TutorResponse> featured() { return service.featured(); }

    @GetMapping("/{id}")
    public TutorResponse get(@PathVariable Long id) { return service.get(id); }

    @Operation(summary = "TUTOR only: own profile")
    @GetMapping("/me/profile")
    public TutorResponse mine(@AuthenticationPrincipal CurrentUser me) { return service.getMine(me.id()); }

    @Operation(summary = "TUTOR only: update own profile")
    @PutMapping("/me/profile")
    public TutorResponse update(@AuthenticationPrincipal CurrentUser me, @Valid @RequestBody TutorProfileUpdateRequest r) {
        return service.updateMine(me.id(), r);
    }
}
