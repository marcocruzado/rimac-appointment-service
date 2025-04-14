import { Appointment } from '../../entities/Appointment';

/**
 * Puerto secundario para la persistencia de citas médicas específicas de un país
 * Define el contrato para cualquier implementación de repositorio de citas por país
 */
export interface CountryAppointmentRepository {
  /**
   * Guarda una cita en la base de datos específica del país
   * @param appointment La cita a guardar
   * @returns Promesa con el resultado de la operación
   */
  saveAppointment(appointment: Appointment): Promise<boolean>;
}