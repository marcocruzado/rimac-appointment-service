import { Appointment } from '../../domain/entities/Appointment';
import { AppointmentRepository } from '../../domain/ports/secondary/AppointmentRepository';

/**
 * Caso de uso para completar el procesamiento de una cita médica
 * Implementa la lógica de negocio para actualizar el estado de una cita
 */
export class CompleteAppointmentUseCase {
  /**
   * Constructor del caso de uso
   * @param appointmentRepository Repositorio de citas
   */
  constructor(
    private readonly appointmentRepository: AppointmentRepository
  ) {}

  /**
   * Ejecuta el caso de uso para completar una cita
   * @param appointmentId ID de la cita a completar
   * @returns Promesa con la cita actualizada
   */
  async execute(appointmentId: string): Promise<Appointment> {
    try {
      // Obtener la cita de DynamoDB
      const appointment = await this.appointmentRepository.findById(appointmentId);
      
      if (!appointment) {
        throw new Error(`Cita no encontrada con ID: ${appointmentId}`);
      }
      
      // Actualizar el estado a COMPLETED
      appointment.complete();
      
      // Guardar la cita actualizada
      const updatedAppointment = await this.appointmentRepository.update(appointment);
      
      return updatedAppointment;
    } catch (error) {
      console.error(`Error al completar la cita ${appointmentId}:`, error);
      throw error;
    }
  }
}