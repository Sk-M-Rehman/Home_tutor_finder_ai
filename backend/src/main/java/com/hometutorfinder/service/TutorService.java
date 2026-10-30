package com.hometutorfinder.service;

import com.hometutorfinder.dto.Dtos.*;
import com.hometutorfinder.entity.*;
import com.hometutorfinder.exception.ApiException;
import com.hometutorfinder.mapper.Mapper;
import com.hometutorfinder.repository.TutorAvailabilityRepository;
import com.hometutorfinder.repository.TutorProfileRepository;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TutorService {
    private static final Map<String, String> SORT_FIELDS = Map.of(
            "hourlyFee", "hourlyFee", "experienceYears", "experienceYears",
            "averageRating", "averageRating", "createdAt", "createdAt");

    private final TutorProfileRepository tutors;
    private final TutorAvailabilityRepository availability;
    private final SubjectService subjectService;

    public record SearchCriteria(String subject, String city, String locality, BigDecimal minFee, BigDecimal maxFee,
                                 BigDecimal minRating, TeachingMode teachingMode, Integer minExperience) {}

    // ---------- tutors ----------
    @Transactional(readOnly = true)
    public PageResponse<TutorResponse> search(SearchCriteria c, int page, int size, String sort) {
        String[] parts = (sort == null ? "createdAt,desc" : sort).split(",");
        String field = SORT_FIELDS.get(parts[0].trim());
        if (field == null) throw ApiException.badRequest("Unsupported sort field");
        Sort.Direction dir = parts.length > 1 && parts[1].trim().equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        PageRequest pr = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 50),
                Sort.by(dir, field).and(Sort.by(Sort.Direction.ASC, "id")));
        Page<TutorProfile> result = tutors.findAll(spec(c), pr);
        return new PageResponse<>(result.getContent().stream().map(Mapper::tutor).toList(),
                result.getNumber(), result.getSize(), result.getTotalElements(), result.getTotalPages());
    }

    private Specification<TutorProfile> spec(SearchCriteria c) {
        return (root, query, cb) -> {
            List<Predicate> p = new ArrayList<>();
            if (has(c.subject())) {
                query.distinct(true);
                Join<TutorProfile, Subject> j = root.join("subjects");
                p.add(cb.like(cb.lower(j.get("name")), like(c.subject()), '\\'));
            }
            if (has(c.city())) p.add(cb.equal(cb.lower(root.get("city")), c.city().trim().toLowerCase()));
            if (has(c.locality())) p.add(cb.like(cb.lower(root.get("locality")), like(c.locality()), '\\'));
            if (c.minFee() != null) p.add(cb.greaterThanOrEqualTo(root.get("hourlyFee"), c.minFee()));
            if (c.maxFee() != null) p.add(cb.lessThanOrEqualTo(root.get("hourlyFee"), c.maxFee()));
            if (c.minRating() != null) p.add(cb.greaterThanOrEqualTo(root.get("averageRating"), c.minRating()));
            if (c.minExperience() != null) p.add(cb.greaterThanOrEqualTo(root.get("experienceYears"), c.minExperience()));
            if (c.teachingMode() != null && c.teachingMode() != TeachingMode.BOTH) {
                p.add(root.get("teachingMode").in(c.teachingMode(), TeachingMode.BOTH));
            }
            return cb.and(p.toArray(new Predicate[0]));
        };
    }

    private static boolean has(String s) { return s != null && !s.isBlank(); }

    private static String like(String s) {
        return "%" + s.trim().toLowerCase().replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_") + "%";
    }

    @Transactional(readOnly = true)
    public List<TutorResponse> featured() {
        PageRequest pr = PageRequest.of(0, 6, Sort.by(Sort.Direction.DESC, "experienceYears").and(Sort.by("id")));
        return tutors.findAll(pr).stream().map(Mapper::tutor).toList();
    }

    @Transactional(readOnly = true)
    public TutorResponse get(Long id) {
        return Mapper.tutor(tutors.findById(id).orElseThrow(() -> ApiException.notFound("Tutor not found")));
    }

    @Transactional(readOnly = true)
    public TutorResponse getMine(Long userId) {
        return Mapper.tutor(mine(userId));
    }

    @Transactional
    public TutorResponse updateMine(Long userId, TutorProfileUpdateRequest r) {
        TutorProfile t = mine(userId);
        User u = t.getUser();
        u.setFullName(r.fullName().trim());
        u.setPhone(r.phone().trim());
        t.setBio(has(r.bio()) ? r.bio().trim() : null);
        t.setCity(r.city().trim());
        t.setLocality(has(r.locality()) ? r.locality().trim() : null);
        t.setQualification(r.qualification().trim());
        t.setExperienceYears(r.experienceYears());
        t.setHourlyFee(r.hourlyFee());
        t.setTeachingMode(r.teachingMode());
        var subs = subjectService.resolve(r.subjectIds());
        t.getSubjects().clear();
        t.getSubjects().addAll(subs);
        return Mapper.tutor(t);
    }

    private TutorProfile mine(Long userId) {
        return tutors.findByUserId(userId).orElseThrow(() -> ApiException.notFound("Tutor profile not found"));
    }

    // ---------- availability ----------
    @Transactional(readOnly = true)
    public List<AvailabilityResponse> availabilityOf(Long tutorId) {
        if (!tutors.existsById(tutorId)) throw ApiException.notFound("Tutor not found");
        return sorted(availability.findByTutorId(tutorId));
    }

    @Transactional(readOnly = true)
    public List<AvailabilityResponse> myAvailability(Long userId) {
        return sorted(availability.findByTutorId(mine(userId).getId()));
    }

    @Transactional
    public AvailabilityResponse addAvailability(Long userId, AvailabilityRequest r) {
        TutorProfile t = mine(userId);
        validateSlot(t.getId(), null, r);
        TutorAvailability a = new TutorAvailability();
        a.setTutor(t);
        apply(a, r);
        return Mapper.availability(availability.save(a));
    }

    @Transactional
    public AvailabilityResponse updateAvailability(Long userId, Long id, AvailabilityRequest r) {
        TutorProfile t = mine(userId);
        TutorAvailability a = owned(t, id);
        validateSlot(t.getId(), id, r);
        apply(a, r);
        return Mapper.availability(a);
    }

    @Transactional
    public void deleteAvailability(Long userId, Long id) {
        availability.delete(owned(mine(userId), id));
    }

    private TutorAvailability owned(TutorProfile t, Long id) {
        TutorAvailability a = availability.findById(id).orElseThrow(() -> ApiException.notFound("Availability slot not found"));
        if (!a.getTutor().getId().equals(t.getId())) throw ApiException.forbidden("This slot belongs to another tutor");
        return a;
    }

    private void validateSlot(Long tutorId, Long selfId, AvailabilityRequest r) {
        if (!r.startTime().isBefore(r.endTime())) throw ApiException.badRequest("Start time must be before end time");
        for (TutorAvailability o : availability.findByTutorIdAndDayOfWeek(tutorId, r.dayOfWeek())) {
            if (o.getId().equals(selfId)) continue;
            if (r.startTime().isBefore(o.getEndTime()) && o.getStartTime().isBefore(r.endTime())) {
                throw ApiException.conflict("This time slot overlaps an existing slot on the same day");
            }
        }
    }

    private void apply(TutorAvailability a, AvailabilityRequest r) {
        a.setDayOfWeek(r.dayOfWeek());
        a.setStartTime(r.startTime());
        a.setEndTime(r.endTime());
        a.setAvailable(r.available() == null || r.available());
    }

    private List<AvailabilityResponse> sorted(List<TutorAvailability> list) {
        return list.stream()
                .sorted(Comparator.comparing(TutorAvailability::getDayOfWeek).thenComparing(TutorAvailability::getStartTime))
                .map(Mapper::availability).toList();
    }
}
