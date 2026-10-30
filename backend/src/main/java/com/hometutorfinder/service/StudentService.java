package com.hometutorfinder.service;

import com.hometutorfinder.dto.Dtos.*;
import com.hometutorfinder.entity.StudentProfile;
import com.hometutorfinder.entity.User;
import com.hometutorfinder.exception.ApiException;
import com.hometutorfinder.mapper.Mapper;
import com.hometutorfinder.repository.StudentProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class StudentService {
    private final StudentProfileRepository students;

    @Transactional(readOnly = true)
    public StudentProfileResponse get(Long userId) {
        return Mapper.student(find(userId));
    }

    @Transactional
    public StudentProfileResponse update(Long userId, StudentProfileUpdateRequest r) {
        StudentProfile s = find(userId);
        User u = s.getUser();
        u.setFullName(r.fullName().trim());
        u.setPhone(r.phone().trim());
        s.setCity(r.city().trim());
        s.setLocality(r.locality() == null || r.locality().isBlank() ? null : r.locality().trim());
        s.setEducationLevel(r.educationLevel().trim());
        s.setPreferredLearningMode(r.preferredLearningMode());
        s.setSubjectsNeeded(r.subjectsNeeded() == null || r.subjectsNeeded().isBlank() ? null : r.subjectsNeeded().trim());
        return Mapper.student(s);
    }

    private StudentProfile find(Long userId) {
        return students.findByUserId(userId).orElseThrow(() -> ApiException.notFound("Student profile not found"));
    }
}
