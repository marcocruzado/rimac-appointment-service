import { Appointment } from '../../domain/entities/Appointment';
import { CountryAppointmentRepository } from '../../domain/ports/secondary/CountryAppointmentRepository';
import { MessageBroker } from '../../domain/ports/secondary/MessageBroker';

/**
 * Caso de uso para procesar una cita médica en un país específico
 * Implementa la lógica de negocio para procesar citas en bases de datos específicas
 */
export class ProcessAppointmentUseCase {
  /**
   * Constructor del caso de uso
   * @param countryRepository Repositorio específico del país
   * @param messageBroker Broker de mensajes
   */
  constructor(
    private readonly countryRepository: CountryAppointmentRepository,
    private readonly messageBroker: MessageBroker
  ) {}

  /**
   * Ejecuta el caso de uso para procesar una cita
   * @param appointment La cita a procesar
   * @returns Promesa con el resultado de la operación
   */
  async execute(appointment: Appointment): Promise<boolean> {
    try {
      // Guardar en la base de datos del país correspondiente (MySQL)
      const success = await this.countryRepository.saveAppointment(appointment);
      
      if (success) {
        // Enviar evento de confirmación a EventBridge
        await this.messageBroker.sendEvent(
          'appointment-event-bus', 
          'appointment.service', 
          'AppointmentConfirmed', 
          appointment
        );
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`Error al procesar la cita ${appointment.id}:`, error);
      throw error;
    }
  }
}