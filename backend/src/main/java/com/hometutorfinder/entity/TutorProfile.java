package com.hometutorfinder.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.BatchSize;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Table(name = "tutor_profiles")
@Getter @Setter @NoArgsConstructor
public class TutorProfile extends Auditable {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(length = 2000)
    private String bio;

    @Column(nullable = false, length = 80)
    private String city;

    @Column(length = 80)
    private String locality;

    @Column(nullable = false, length = 255)
    private String qualification;

    @Column(name = "experience_years", nullable = false)
    private Integer experienceYears = 0;

    @Column(name = "hourly_fee", nullable = false, precision = 10, scale = 2)
    private BigDecimal hourlyFee;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "teaching_mode", nullable = false, length = 20)
    private TeachingMode teachingMode;

    @Column(name = "average_rating", precision = 3, scale = 2)
    private BigDecimal averageRating;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "tutor_subjects",
            joinColumns = @JoinColumn(name = "tutor_id"),
            inverseJoinColumns = @JoinColumn(name = "subject_id"))
    @BatchSize(size = 50)
    private Set<Subject> subjects = new LinkedHashSet<>();
}
