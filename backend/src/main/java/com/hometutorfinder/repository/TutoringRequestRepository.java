package com.hometutorfinder.repository;

import com.hometutorfinder.entity.TutoringRequest;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TutoringRequestRepository extends JpaRepository<TutoringRequest, Long> {
    @EntityGraph(attributePaths = "payment")
    List<TutoringRequest> findByStudentIdOrderByCreatedAtDesc(Long studentId);

    @EntityGraph(attributePaths = "payment")
    List<TutoringRequest> findByTutorIdOrderByCreatedAtDesc(Long tutorId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select r from TutoringRequest r where r.id = :id")
    java.util.Optional<TutoringRequest> findByIdForUpdate(@Param("id") Long id);
}
