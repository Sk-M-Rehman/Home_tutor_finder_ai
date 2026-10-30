package com.hometutorfinder.service;

import com.hometutorfinder.dto.Dtos.*;
import com.hometutorfinder.entity.*;
import com.hometutorfinder.exception.ApiException;
import com.hometutorfinder.mapper.Mapper;
import com.hometutorfinder.repository.*;
import com.hometutorfinder.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TutoringRequestService {
    private final TutoringRequestRepository requests;
    private final StudentProfileRepository students;
    private final TutorProfileRepository tutors;
    private final SubjectRepository subjects;
    private final ApplicationEventPublisher events;

    @Transactional
    public RequestResponse create(CurrentUser me, TutoringRequestCreate r) {
        StudentProfile sp = students.findByUserId(me.id()).orElseThrow(() -> ApiException.notFound("Student profile not found"));
        TutorProfile tp = tutors.findById(r.tutorId()).orElseThrow(() -> ApiException.notFound("Tutor not found"));
        Subject s = subjects.findById(r.subjectId()).orElseThrow(() -> ApiException.badRequest("Subject not found"));
        if (!tp.getSubjects().contains(s)) throw ApiException.badRequest("This tutor does not teach the selected subject");
        if (LocalDateTime.of(r.requestedDate(), r.requestedTime()).isBefore(LocalDateTime.now())) {
            throw ApiException.badRequest("Requested date and time must be in the future");
        }
        TutoringRequest t = new TutoringRequest();
        t.setStudent(sp);
        t.setTutor(tp);
        t.setSubject(s);
        t.setMessage(r.message().trim());
        t.setRequestedDate(r.requestedDate());
        t.setRequestedTime(r.requestedTime());
        t.setPaymentAmount(tp.getHourlyFee());
        t.setStatus(RequestStatus.PENDING);
        TutoringRequest saved = requests.save(t);
        events.publishEvent(new RegistrationEmailService.SlotBooked(
                saved.getStudent().getUser().getEmail(), saved.getStudent().getUser().getFullName(),
                saved.getTutor().getUser().getEmail(), saved.getTutor().getUser().getFullName(),
                saved.getSubject().getName(), saved.getRequestedDate().toString(),
                saved.getRequestedTime().toString(), saved.getMessage()));
        return Mapper.request(saved, Role.STUDENT);
    }

    @Transactional(readOnly = true)
    public List<RequestResponse> forStudent(CurrentUser me) {
        StudentProfile sp = students.findByUserId(me.id()).orElseThrow(() -> ApiException.notFound("Student profile not found"));
        return requests.findByStudentIdOrderByCreatedAtDesc(sp.getId()).stream().map(x -> Mapper.request(x, Role.STUDENT)).toList();
    }

    @Transactional(readOnly = true)
    public List<RequestResponse> forTutor(CurrentUser me) {
        TutorProfile tp = tutors.findByUserId(me.id()).orElseThrow(() -> ApiException.notFound("Tutor profile not found"));
        return requests.findByTutorIdOrderByCreatedAtDesc(tp.getId()).stream().map(x -> Mapper.request(x, Role.TUTOR)).toList();
    }

    /** Tutor accepts/rejects a PENDING request addressed to them. */
    @Transactional
    public RequestResponse updateStatus(CurrentUser me, Long id, RequestStatus target) {
        TutoringRequest r = requests.findById(id).orElseThrow(() -> ApiException.notFound("Request not found"));
        if (!r.getTutor().getUser().getId().equals(me.id())) throw ApiException.forbidden("This request is not addressed to you");
        if (target != RequestStatus.ACCEPTED && target != RequestStatus.REJECTED) {
            throw ApiException.badRequest("Tutors can only accept or reject requests");
        }
        if (r.getStatus() != RequestStatus.PENDING) {
            throw ApiException.conflict("Only pending requests can be " + target.name().toLowerCase());
        }
        r.setStatus(target);
        return Mapper.request(r, Role.TUTOR);
    }

    /** Student cancels their own PENDING or ACCEPTED request. */
    @Transactional
    public RequestResponse cancel(CurrentUser me, Long id) {
        TutoringRequest r = requests.findById(id).orElseThrow(() -> ApiException.notFound("Request not found"));
        if (!r.getStudent().getUser().getId().equals(me.id())) throw ApiException.forbidden("This is not your request");
        if (r.getStatus() != RequestStatus.PENDING && r.getStatus() != RequestStatus.ACCEPTED) {
            throw ApiException.conflict("This request can no longer be cancelled");
        }
        if (r.getPayment() != null) {
            throw ApiException.conflict("Payment has been initiated for this request, so it cannot be cancelled online. Please contact support.");
        }
        r.setStatus(RequestStatus.CANCELLED);
        return Mapper.request(r, Role.STUDENT);
    }
}
