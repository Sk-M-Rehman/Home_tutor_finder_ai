package com.hometutorfinder.repository;

import com.hometutorfinder.entity.TutoringPayment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TutoringPaymentRepository extends JpaRepository<TutoringPayment, Long> {
    Optional<TutoringPayment> findByRequest_Id(Long requestId);
}
