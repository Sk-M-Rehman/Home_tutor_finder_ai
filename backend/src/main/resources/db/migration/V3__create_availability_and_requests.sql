CREATE TABLE tutor_availability (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  tutor_id BIGINT NOT NULL,
  day_of_week VARCHAR(10) NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT fk_avail_tutor FOREIGN KEY (tutor_id) REFERENCES tutor_profiles (id) ON DELETE CASCADE,
  CONSTRAINT chk_avail_time CHECK (start_time < end_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE INDEX idx_avail_tutor_day ON tutor_availability (tutor_id, day_of_week);

CREATE TABLE tutoring_requests (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  student_id BIGINT NOT NULL,
  tutor_id BIGINT NOT NULL,
  subject_id BIGINT NOT NULL,
  message VARCHAR(1000) NOT NULL,
  requested_date DATE NOT NULL,
  requested_time TIME NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  CONSTRAINT fk_req_student FOREIGN KEY (student_id) REFERENCES student_profiles (id) ON DELETE CASCADE,
  CONSTRAINT fk_req_tutor FOREIGN KEY (tutor_id) REFERENCES tutor_profiles (id) ON DELETE CASCADE,
  CONSTRAINT fk_req_subject FOREIGN KEY (subject_id) REFERENCES subjects (id),
  CONSTRAINT chk_req_status CHECK (status IN ('PENDING','ACCEPTED','REJECTED','CANCELLED'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE INDEX idx_req_status ON tutoring_requests (status);
CREATE INDEX idx_req_tutor_status ON tutoring_requests (tutor_id, status);
CREATE INDEX idx_req_student ON tutoring_requests (student_id);
