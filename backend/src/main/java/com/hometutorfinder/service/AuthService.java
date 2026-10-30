package com.hometutorfinder.service;

import com.hometutorfinder.dto.Dtos.*;
import com.hometutorfinder.entity.*;
import com.hometutorfinder.exception.ApiException;
import com.hometutorfinder.mapper.Mapper;
import com.hometutorfinder.repository.StudentProfileRepository;
import com.hometutorfinder.repository.TutorProfileRepository;
import com.hometutorfinder.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository users;
    private final StudentProfileRepository students;
    private final TutorProfileRepository tutors;
    private final SubjectService subjectService;
    private final PasswordEncoder encoder;
    private final ApplicationEventPublisher events;

    @Transactional
    public User register(RegisterRequest r) {
        String email = r.email().trim().toLowerCase();
        if (!r.password().equals(r.confirmPassword())) throw ApiException.badRequest("Passwords do not match");
        checkStrength(r.password());
        if (users.existsByEmailIgnoreCase(email)) {
            throw new ApiException(HttpStatus.CONFLICT, "An account with this email already exists");
        }

        User u = new User();
        u.setFullName(r.fullName().trim());
        u.setEmail(email);
        u.setPhone(r.phone().trim());
        u.setPasswordHash(encoder.encode(r.password()));
        u.setRole(r.role());
        u.setEnabled(true);
        users.save(u);

        if (r.role() == Role.STUDENT) {
            if (blank(r.educationLevel()) || r.preferredLearningMode() == null) {
                throw ApiException.badRequest("Education level and preferred learning mode are required for students");
            }
            StudentProfile sp = new StudentProfile();
            sp.setUser(u);
            sp.setCity(r.city().trim());
            sp.setLocality(trim(r.locality()));
            sp.setEducationLevel(r.educationLevel().trim());
            sp.setPreferredLearningMode(r.preferredLearningMode());
            sp.setSubjectsNeeded(trim(r.subjectsNeeded()));
            students.save(sp);
        } else {
            if (blank(r.qualification()) || r.experienceYears() == null || r.teachingMode() == null || r.hourlyFee() == null) {
                throw ApiException.badRequest("Qualification, experience, teaching mode and fee are required for tutors");
            }
            TutorProfile tp = new TutorProfile();
            tp.setUser(u);
            tp.setCity(r.city().trim());
            tp.setLocality(trim(r.locality()));
            tp.setQualification(r.qualification().trim());
            tp.setExperienceYears(r.experienceYears());
            tp.setHourlyFee(r.hourlyFee());
            tp.setTeachingMode(r.teachingMode());
            tp.getSubjects().addAll(subjectService.resolve(r.subjectIds()));
            tutors.save(tp);
        }
        events.publishEvent(new RegistrationEmailService.RegisteredUser(u.getEmail(), u.getFullName(), u.getRole().name()));
        return u;
    }

    @Transactional(readOnly = true)
    public UserResponse me(Long userId) {
        return Mapper.user(users.findById(userId).orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Authentication required")));
    }

    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest r) {
        User u = users.findById(userId).orElseThrow(() -> ApiException.notFound("User not found"));
        if (!encoder.matches(r.currentPassword(), u.getPasswordHash())) throw ApiException.badRequest("Current password is incorrect");
        if (!r.newPassword().equals(r.confirmNewPassword())) throw ApiException.badRequest("New passwords do not match");
        checkStrength(r.newPassword());
        u.setPasswordHash(encoder.encode(r.newPassword()));
    }

    private static void checkStrength(String p) {
        if (!p.matches(".*[A-Za-z].*") || !p.matches(".*[0-9].*")) {
            throw ApiException.badRequest("Password must contain at least one letter and one digit");
        }
    }

    private static boolean blank(String s) { return s == null || s.isBlank(); }
    private static String trim(String s) { return blank(s) ? null : s.trim(); }
}
