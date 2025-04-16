import { Appointment } from '../../domain/entities/Appointment';
import { AppointmentRepository } from '../../domain/ports/secondary/AppointmentRepository';
import { MessageBroker } from '../../domain/ports/secondary/MessageBroker';


export class ProcessAppointmentUseCase {

  constructor(
    private readonly appointmentRepository: AppointmentRepository,
    private readonly messageBroker: MessageBroker
  ) {}


  async execute(appointment: Appointment): Promise<boolean> {
    try {
      appointment.confirm();
      
      await this.appointmentRepository.update(appointment);
      
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