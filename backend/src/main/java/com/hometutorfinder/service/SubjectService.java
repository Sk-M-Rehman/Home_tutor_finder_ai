package com.hometutorfinder.service;

import com.hometutorfinder.dto.Dtos.SubjectResponse;
import com.hometutorfinder.entity.Subject;
import com.hometutorfinder.exception.ApiException;
import com.hometutorfinder.mapper.Mapper;
import com.hometutorfinder.repository.SubjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class SubjectService {
    private final SubjectRepository subjects;

    @Transactional(readOnly = true)
    public List<SubjectResponse> list() {
        return subjects.findAllByOrderByNameAsc().stream().map(Mapper::subject).toList();
    }

    @Transactional(readOnly = true)
    public Set<Subject> resolve(List<Long> ids) {
        if (ids == null || ids.isEmpty()) throw ApiException.badRequest("Select at least one subject");
        Set<Long> unique = new HashSet<>(ids);
        List<Subject> found = subjects.findAllById(unique);
        if (found.size() != unique.size()) throw ApiException.badRequest("One or more selected subjects do not exist");
        return new HashSet<>(found);
    }
}
