CREATE TABLE subjects (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  description VARCHAR(255) NULL,
  CONSTRAINT uq_subject_name UNIQUE (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE tutor_subjects (
  tutor_id BIGINT NOT NULL,
  subject_id BIGINT NOT NULL,
  PRIMARY KEY (tutor_id, subject_id),
  CONSTRAINT fk_ts_tutor FOREIGN KEY (tutor_id) REFERENCES tutor_profiles (id) ON DELETE CASCADE,
  CONSTRAINT fk_ts_subject FOREIGN KEY (subject_id) REFERENCES subjects (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE INDEX idx_ts_subject ON tutor_subjects (subject_id);

INSERT INTO subjects (name, description) VALUES
 ('Mathematics', 'Arithmetic, algebra, geometry, calculus'),
 ('Physics', 'Mechanics, electricity, optics, modern physics'),
 ('Chemistry', 'Organic, inorganic and physical chemistry'),
 ('Biology', 'Botany, zoology and human biology'),
 ('English', 'Grammar, writing, literature and spoken English'),
 ('Hindi', 'Hindi language and literature'),
 ('Telugu', 'Telugu language and literature'),
 ('Computer Science', 'Programming and computer fundamentals'),
 ('Social Studies', 'History, geography and civics'),
 ('Accountancy', 'Accounting and commerce basics'),
 ('Economics', 'Micro and macro economics'),
 ('Science', 'General science for school classes');
