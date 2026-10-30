package com.hometutorfinder.mapper;

import com.hometutorfinder.dto.Dtos.*;
import com.hometutorfinder.entity.*;

import java.util.Comparator;

public final class Mapper {
    private Mapper() {}

    public static UserResponse user(User u) {
        return new UserResponse(u.getId(), u.getFullName(), u.getEmail(), u.getPhone(), u.getRole());
    }

    public static SubjectResponse subject(Subject s) {
        return new SubjectResponse(s.getId(), s.getName(), s.getDescription());
    }

    public static TutorResponse tutor(TutorProfile t) {
        return new TutorResponse(t.getId(), t.getUser().getFullName(), t.getBio(), t.getCity(), t.getLocality(),
                t.getQualification(), t.getExperienceYears(), t.getHourlyFee(), t.getTeachingMode(), t.getAverageRating(),
                t.getSubjects().stream().sorted(Comparator.comparing(Subject::getName)).map(Mapper::subject).toList());
    }

    public static StudentProfileResponse student(StudentProfile s) {
        User u = s.getUser();
        return new StudentProfileResponse(s.getId(), u.getFullName(), u.getEmail(), u.getPhone(), s.getCity(),
                s.getLocality(), s.getEducationLevel(), s.getPreferredLearningMode(), s.getSubjectsNeeded());
    }

    public static AvailabilityResponse availability(TutorAvailability a) {
        return new AvailabilityResponse(a.getId(), a.getDayOfWeek(), a.getStartTime(), a.getEndTime(), a.isAvailable());
    }

    /** Contact phone of the other party is revealed only once a request is ACCEPTED. */
    public static RequestResponse request(TutoringRequest r, Role viewer) {
        User tutorUser = r.getTutor().getUser();
        User studentUser = r.getStudent().getUser();
        String phone = null;
        if (r.getStatus() == RequestStatus.ACCEPTED) {
            phone = viewer == Role.TUTOR ? studentUser.getPhone() : tutorUser.getPhone();
        }
        return new RequestResponse(r.getId(), r.getTutor().getId(), tutorUser.getFullName(), r.getStudent().getId(),
                studentUser.getFullName(), r.getSubject().getId(), r.getSubject().getName(), r.getMessage(),
                r.getRequestedDate(), r.getRequestedTime(), r.getStatus(), r.getPaymentAmount(),
                r.getPayment() == null ? null : r.getPayment().getStatus(), r.getCreatedAt(), phone);
    }
}
