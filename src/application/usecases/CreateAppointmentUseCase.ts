import { v4 as uuidv4 } from 'uuid';
import { Appointment, AppointmentStatus, CreateAppointmentDto } from '../../domain/entities/Appointment';
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
  async execute(data: CreateAppointmentDto): Promise<Appointment> {
    try {
      // Verificar si el asegurado ya tiene citas pendientes
      const existingAppointments = await this.appointmentRepository.findByInsuredId(data.insuredId);

      const hasPendingAppointment = existingAppointments.some(
        appointment => appointment.status === AppointmentStatus.PENDING
      );

      if (hasPendingAppointment) {
        throw new Error('El asegurado ya tiene una cita pendiente');
      }

      // Crear la entidad de dominio
      const appointment = new Appointment(
        uuidv4(),
        data.insuredId,
        data.scheduleId,
        data.countryIso,
        AppointmentStatus.PENDING,
        new Date(),
        new Date()
      );

      // Guardar en la base de datos
      const savedAppointment = await this.appointmentRepository.save(appointment);

      // Publicar evento
      await this.messageBroker.publish(
        'appointment-created',
        savedAppointment,
        { countryIso: savedAppointment.countryIso }
      );

      return savedAppointment;
    } catch (error: any) {
      console.error('Error al crear cita:', error);
      throw error;
    }
  }
}