package com.hometutorfinder.dto;

import com.hometutorfinder.entity.RequestStatus;
import com.hometutorfinder.entity.PaymentStatus;
import com.hometutorfinder.entity.Role;
import com.hometutorfinder.entity.TeachingMode;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

/** All request/response DTOs. Entities are never returned from controllers. */
public final class Dtos {
    private Dtos() {}

    private static final String PHONE_RE = "^[+]?[0-9 \\-]{10,15}$";

    public record RegisterRequest(
            @NotBlank @Size(max = 100) String fullName,
            @NotBlank @Email @Size(max = 190) String email,
            @NotBlank @Pattern(regexp = PHONE_RE, message = "Enter a valid phone number") String phone,
            @NotBlank @Size(min = 8, max = 72) String password,
            @NotBlank String confirmPassword,
            @NotNull Role role,
            @NotNull @AssertTrue(message = "You must accept the terms and conditions") Boolean acceptTerms,
            @NotBlank @Size(max = 80) String city,
            @Size(max = 80) String locality,
            @Size(max = 80) String educationLevel,
            TeachingMode preferredLearningMode,
            @Size(max = 500) String subjectsNeeded,
            @Size(max = 255) String qualification,
            @Min(0) @Max(60) Integer experienceYears,
            TeachingMode teachingMode,
            @DecimalMin("1") @DecimalMax("20000") BigDecimal hourlyFee,
            List<Long> subjectIds) {}

    public record LoginRequest(@NotBlank @Email String email, @NotBlank String password) {}

    public record ChangePasswordRequest(
            @NotBlank String currentPassword,
            @NotBlank @Size(min = 8, max = 72) String newPassword,
            @NotBlank String confirmNewPassword) {}

    public record UserResponse(Long id, String fullName, String email, String phone, Role role) {}

    public record SubjectResponse(Long id, String name, String description) {}

    public record TutorResponse(
            Long id, String fullName, String bio, String city, String locality, String qualification,
            Integer experienceYears, BigDecimal hourlyFee, TeachingMode teachingMode,
            BigDecimal averageRating, List<SubjectResponse> subjects) {}

    public record TutorProfileUpdateRequest(
            @NotBlank @Size(max = 100) String fullName,
            @NotBlank @Pattern(regexp = PHONE_RE, message = "Enter a valid phone number") String phone,
            @Size(max = 2000) String bio,
            @NotBlank @Size(max = 80) String city,
            @Size(max = 80) String locality,
            @NotBlank @Size(max = 255) String qualification,
            @NotNull @Min(0) @Max(60) Integer experienceYears,
            @NotNull @DecimalMin("1") @DecimalMax("20000") BigDecimal hourlyFee,
            @NotNull TeachingMode teachingMode,
            @NotEmpty List<Long> subjectIds) {}

    public record StudentProfileResponse(
            Long id, String fullName, String email, String phone, String city, String locality,
            String educationLevel, TeachingMode preferredLearningMode, String subjectsNeeded) {}

    public record StudentProfileUpdateRequest(
            @NotBlank @Size(max = 100) String fullName,
            @NotBlank @Pattern(regexp = PHONE_RE, message = "Enter a valid phone number") String phone,
            @NotBlank @Size(max = 80) String city,
            @Size(max = 80) String locality,
            @NotBlank @Size(max = 80) String educationLevel,
            @NotNull TeachingMode preferredLearningMode,
            @Size(max = 500) String subjectsNeeded) {}

    public record AvailabilityRequest(
            @NotNull DayOfWeek dayOfWeek,
            @NotNull LocalTime startTime,
            @NotNull LocalTime endTime,
            Boolean available) {}

    public record AvailabilityResponse(Long id, DayOfWeek dayOfWeek, LocalTime startTime, LocalTime endTime, boolean available) {}

    public record TutoringRequestCreate(
            @NotNull Long tutorId,
            @NotNull Long subjectId,
            @NotBlank @Size(max = 1000) String message,
            @NotNull @FutureOrPresent LocalDate requestedDate,
            @NotNull LocalTime requestedTime) {}

    public record StatusUpdateRequest(@NotNull RequestStatus status) {}

    public record RequestResponse(
            Long id, Long tutorId, String tutorName, Long studentId, String studentName,
            Long subjectId, String subjectName, String message, LocalDate requestedDate,
            LocalTime requestedTime, RequestStatus status, BigDecimal paymentAmount,
            PaymentStatus paymentStatus, LocalDateTime createdAt,
            String contactPhone) {}

    public record PaymentOrderResponse(
            String keyId, String orderId, long amount, String currency, String name, String description) {}

    public record PaymentVerificationRequest(
            @NotBlank @Size(max = 64) String razorpayOrderId,
            @NotBlank @Size(max = 64) String razorpayPaymentId,
            @NotBlank @Size(max = 128) String razorpaySignature) {}

    public record PaymentResponse(
            Long requestId, String orderId, String paymentId, BigDecimal amount,
            String currency, PaymentStatus status) {}

    public record PageResponse<T>(List<T> content, int page, int size, long totalElements, int totalPages) {}

    public record ErrorResponse(java.time.Instant timestamp, int status, String error, String message, Map<String, String> fieldErrors) {}
}
