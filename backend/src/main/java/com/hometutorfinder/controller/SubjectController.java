package com.hometutorfinder.controller;

import com.hometutorfinder.dto.Dtos.SubjectResponse;
import com.hometutorfinder.service.SubjectService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/subjects")
@RequiredArgsConstructor
@Tag(name = "Subjects")
public class SubjectController {
    private final SubjectService service;

    @GetMapping
    public List<SubjectResponse> list() { return service.list(); }
}
