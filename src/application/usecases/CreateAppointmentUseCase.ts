import { v4 as uuidv4 } from 'uuid';
import { Appointment, CreateAppointmentRequest, CountryISO, AppointmentStatus } from '../../domain/entities/Appointment';
import { AppointmentRepository } from '../../domain/ports/secondary/AppointmentRepository';
import { MessageBroker } from '../../domain/ports/secondary/MessageBroker';

/**
 * Caso de uso para la creación de una cita médica
 * Implementa la lógica de negocio para crear y publicar una nueva cita
 */
export class CreateAppointmentUseCase {
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
   * Ejecuta el caso de uso para crear una cita
   * @param request Datos para crear la cita
   * @returns Promesa con la cita creada
   */
  async execute(request: CreateAppointmentRequest): Promise<Appointment> {
    try {
      // Validar el país
      const countryISO = request.countryISO as CountryISO;
      if (!Object.values(CountryISO).includes(countryISO)) {
        throw new Error(`País no válido: ${request.countryISO}. Debe ser PE o CL.`);
      }

      // Crear la entidad de dominio
      const appointmentId = uuidv4();
      const appointment = new Appointment(
        appointmentId,
        request.insuredId,
        request.scheduleId,
        countryISO,
        AppointmentStatus.PENDING
      );

      // Guardar en DynamoDB
      const savedAppointment = await this.appointmentRepository.save(appointment);

      // Publicar en SNS con filtro por país
      await this.messageBroker.publish(
        'appointment-topic', 
        savedAppointment,
        { countryISO: savedAppointment.countryISO }
      );

      return savedAppointment;
    } catch (error) {
      console.error('Error al crear cita:', error);
      throw error;
    }
  }
}