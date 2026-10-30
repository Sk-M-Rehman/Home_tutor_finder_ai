package com.hometutorfinder.controller;

import com.hometutorfinder.dto.Dtos.*;
import com.hometutorfinder.security.CurrentUser;
import com.hometutorfinder.service.StudentService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/students/me/profile")
@RequiredArgsConstructor
@Tag(name = "Students (STUDENT role only)")
public class StudentController {
    private final StudentService service;

    @GetMapping
    public StudentProfileResponse get(@AuthenticationPrincipal CurrentUser me) { return service.get(me.id()); }

    @PutMapping
    public StudentProfileResponse update(@AuthenticationPrincipal CurrentUser me, @Valid @RequestBody StudentProfileUpdateRequest r) {
        return service.update(me.id(), r);
    }
}
