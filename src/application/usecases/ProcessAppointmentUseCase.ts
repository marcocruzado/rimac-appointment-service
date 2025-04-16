import { Appointment } from '../../domain/entities/Appointment';
import { AppointmentRepository } from '../../domain/ports/secondary/AppointmentRepository';
import { MessageBroker } from '../../domain/ports/secondary/MessageBroker';

/**
 * Caso de uso para procesar una cita médica en un país específico
 * Implementa la lógica de negocio para procesar citas en bases de datos específicas
 */
export class ProcessAppointmentUseCase {
  /**
   * Constructor del caso de uso
   * @param appointmentRepository Repositorio específico del país
   * @param messageBroker Broker de mensajes
   */
  constructor(
    private readonly appointmentRepository: AppointmentRepository,
    private readonly messageBroker: MessageBroker
  ) {}

  /**
   * Ejecuta el caso de uso para procesar una cita
   * @param appointment La cita a procesar
   * @returns Promesa con el resultado de la operación
   */
  async execute(appointment: Appointment): Promise<boolean> {
    try {
      // Confirmar la cita
      appointment.confirm();
      
      // Actualizar en la base de datos
      await this.appointmentRepository.update(appointment);
      
      // Publicar evento de confirmación
      await this.messageBroker.publish(
        'appointment.confirmed',
        appointment,
        { countryIso: appointment.countryIso }
      );
      
      return true;
    } catch (error) {
      console.error(`Error al procesar la cita ${appointment.id}:`, error);
      return false;
    }
  }
}