import { Appointment } from '../../entities/Appointment';

/**
 * Puerto secundario para la persistencia de citas médicas
 * Define el contrato para cualquier implementación de repositorio de citas
 */
export interface AppointmentRepository {
  /**
   * Guarda una cita en el repositorio
   * @param appointment La cita a guardar
   * @returns Promesa con la cita guardada
   */
  save(appointment: Appointment): Promise<Appointment>;
  
  /**
   * Busca una cita por su ID
   * @param id ID de la cita
   * @returns Promesa con la cita encontrada o null
   */
  findById(id: string): Promise<Appointment | null>;
  
  /**
   * Busca todas las citas de un asegurado
   * @param insuredId ID del asegurado
   * @returns Promesa con la lista de citas
   */
  findByInsuredId(insuredId: string): Promise<Appointment[]>;
  
  /**
   * Actualiza el estado de una cita
   * @param appointment La cita con el estado actualizado
   * @returns Promesa con la cita actualizada
   */
  update(appointment: Appointment): Promise<Appointment>;
}