CREATE TABLE users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(190) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  password_hash VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  CONSTRAINT uq_users_email UNIQUE (email),
  CONSTRAINT chk_users_role CHECK (role IN ('STUDENT','TUTOR'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE student_profiles (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  city VARCHAR(80) NOT NULL,
  locality VARCHAR(80) NULL,
  education_level VARCHAR(80) NULL,
  preferred_learning_mode VARCHAR(20) NULL,
  subjects_needed VARCHAR(500) NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  CONSTRAINT uq_student_user UNIQUE (user_id),
  CONSTRAINT fk_student_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE INDEX idx_student_city ON student_profiles (city);

CREATE TABLE tutor_profiles (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  bio VARCHAR(2000) NULL,
  city VARCHAR(80) NOT NULL,
  locality VARCHAR(80) NULL,
  qualification VARCHAR(255) NOT NULL,
  experience_years INT NOT NULL DEFAULT 0,
  hourly_fee DECIMAL(10,2) NOT NULL,
  teaching_mode VARCHAR(20) NOT NULL,
  average_rating DECIMAL(3,2) NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  CONSTRAINT uq_tutor_user UNIQUE (user_id),
  CONSTRAINT fk_tutor_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT chk_tutor_fee CHECK (hourly_fee > 0),
  CONSTRAINT chk_tutor_exp CHECK (experience_years >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE INDEX idx_tutor_city ON tutor_profiles (city);
CREATE INDEX idx_tutor_locality ON tutor_profiles (locality);
CREATE INDEX idx_tutor_fee ON tutor_profiles (hourly_fee);
CREATE INDEX idx_tutor_mode ON tutor_profiles (teaching_mode);
CREATE INDEX idx_tutor_experience ON tutor_profiles (experience_years);
