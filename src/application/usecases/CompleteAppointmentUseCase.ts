import { Appointment } from '../../domain/entities/Appointment';
import { AppointmentRepository } from '../../domain/ports/secondary/AppointmentRepository';
import { MessageBroker } from '../../domain/ports/secondary/MessageBroker';

/**
 * Caso de uso para completar el procesamiento de una cita médica
 * Implementa la lógica de negocio para actualizar el estado de una cita
 */
export class CompleteAppointmentUseCase {
  /**
   * Constructor del caso de uso
   * @param appointmentRepository Repositorio de citas
   * @param messageBroker Broker de mensajes
   */
  constructor(
    private readonly appointmentRepository: AppointmentRepository,
    private readonly messageBroker: MessageBroker
  ) {}

  /**
   * Ejecuta el caso de uso para completar una cita
   * @param appointmentId ID de la cita a completar
   * @returns Promesa con la cita actualizada
   */
  async execute(appointmentId: string): Promise<Appointment> {
    try {
      // Obtener la cita
      const appointment = await this.appointmentRepository.findById(appointmentId);
      
      if (!appointment) {
        throw new Error(`Cita no encontrada con ID: ${appointmentId}`);
      }
      
      // Completar la cita
      appointment.complete();
      
      // Actualizar en la base de datos
      const updatedAppointment = await this.appointmentRepository.update(appointment);
      
      // Publicar evento de completado
      await this.messageBroker.publish(
        'appointment.completed',
        updatedAppointment,
        { countryIso: updatedAppointment.countryIso }
      );
      
      return updatedAppointment;
    } catch (error) {
      console.error(`Error al completar la cita ${appointmentId}:`, error);
      throw error;
    }
  }
}