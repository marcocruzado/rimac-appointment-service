-- Tabla para Perú
CREATE TABLE IF NOT EXISTS appointments_pe (
  id VARCHAR(36) PRIMARY KEY,
  insured_id VARCHAR(36) NOT NULL,
  schedule_id VARCHAR(36) NOT NULL,
  country_iso CHAR(2) NOT NULL,
  status VARCHAR(20) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_insured_id (insured_id),
  INDEX idx_schedule_id (schedule_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla para Chile
CREATE TABLE IF NOT EXISTS appointments_cl (
  id VARCHAR(36) PRIMARY KEY,
  insured_id VARCHAR(36) NOT NULL,
  schedule_id VARCHAR(36) NOT NULL,
  country_iso CHAR(2) NOT NULL,
  status VARCHAR(20) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_insured_id (insured_id),
  INDEX idx_schedule_id (schedule_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci; 