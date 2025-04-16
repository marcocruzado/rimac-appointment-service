export const createAppointmentsTableSQL = (countrySuffix: string) => `
  CREATE TABLE IF NOT EXISTS appointments_${countrySuffix} (
    id VARCHAR(36) PRIMARY KEY,
    insured_id VARCHAR(36) NOT NULL,
    schedule_id VARCHAR(36) NOT NULL,
    country_iso VARCHAR(2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  );
`;
