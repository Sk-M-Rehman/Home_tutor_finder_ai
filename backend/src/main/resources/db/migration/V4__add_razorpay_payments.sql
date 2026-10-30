ALTER TABLE tutoring_requests
  ADD COLUMN payment_amount DECIMAL(10,2) NULL;

UPDATE tutoring_requests r
JOIN tutor_profiles t ON t.id = r.tutor_id
SET r.payment_amount = t.hourly_fee;

ALTER TABLE tutoring_requests
  MODIFY COLUMN payment_amount DECIMAL(10,2) NOT NULL;

CREATE TABLE tutoring_payments (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  request_id BIGINT NOT NULL UNIQUE,
  razorpay_order_id VARCHAR(64) NOT NULL UNIQUE,
  razorpay_payment_id VARCHAR(64) NULL UNIQUE,
  amount_paise BIGINT NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'INR',
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  CONSTRAINT fk_payment_request FOREIGN KEY (request_id) REFERENCES tutoring_requests (id) ON DELETE CASCADE,
  CONSTRAINT chk_payment_status CHECK (status IN ('PENDING','PAID')),
  CONSTRAINT chk_payment_amount CHECK (amount_paise > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
