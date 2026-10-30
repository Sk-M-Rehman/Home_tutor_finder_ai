package com.hometutorfinder.repository;

import com.hometutorfinder.entity.TutorAvailability;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.DayOfWeek;
import java.util.List;

public interface TutorAvailabilityRepository extends JpaRepository<TutorAvailability, Long> {
    List<TutorAvailability> findByTutorId(Long tutorId);
    List<TutorAvailability> findByTutorIdAndDayOfWeek(Long tutorId, DayOfWeek day);
}
