import { v4 as uuidv4 } from 'uuid';
import { Appointment, AppointmentStatus, CreateAppointmentDto } from '../../domain/entities/Appointment';
import { AppointmentRepository } from '../../domain/ports/secondary/AppointmentRepository';
import { MessageBroker } from '../../domain/ports/secondary/MessageBroker';


export class CreateAppointmentUseCase {

  constructor(
    private readonly appointmentRepository: AppointmentRepository,
    private readonly messageBroker: MessageBroker
  ) {}


  async execute(data: CreateAppointmentDto): Promise<Appointment> {
    try {
      const existingAppointments = await this.appointmentRepository.findByInsuredId(data.insuredId);

      const hasPendingAppointment = existingAppointments.some(
        appointment => appointment.status === AppointmentStatus.PENDING
      );

      if (hasPendingAppointment) {
        throw new Error('El asegurado ya tiene una cita pendiente');
      }

      const appointment = new Appointment(
        uuidv4(),
        data.insuredId,
        data.scheduleId,
        data.countryIso,
        AppointmentStatus.PENDING,
        new Date(),
        new Date()
      );

      const savedAppointment = await this.appointmentRepository.save(appointment);

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