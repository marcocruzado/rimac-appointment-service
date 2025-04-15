export const createAppointmentsTableSQL = (countrySuffix: string) => `
  CREATE TABLE IF NOT EXISTS appointments_${countrySuffix} (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    scheduled_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;
