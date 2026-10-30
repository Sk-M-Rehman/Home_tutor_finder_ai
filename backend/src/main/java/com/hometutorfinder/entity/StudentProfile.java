package com.hometutorfinder.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "student_profiles")
@Getter @Setter @NoArgsConstructor
public class StudentProfile extends Auditable {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false, length = 80)
    private String city;

    @Column(length = 80)
    private String locality;

    @Column(name = "education_level", length = 80)
    private String educationLevel;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "preferred_learning_mode", length = 20)
    private TeachingMode preferredLearningMode;

    @Column(name = "subjects_needed", length = 500)
    private String subjectsNeeded;
}
