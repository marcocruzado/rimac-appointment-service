import { Appointment } from '../../domain/entities/Appointment';
import { AppointmentRepository } from '../../domain/ports/secondary/AppointmentRepository';
import { MessageBroker } from '../../domain/ports/secondary/MessageBroker';


export class CompleteAppointmentUseCase {

  constructor(
    private readonly appointmentRepository: AppointmentRepository,
    private readonly messageBroker: MessageBroker
  ) {}


  async execute(appointmentId: string): Promise<Appointment> {
    try {
      const appointment = await this.appointmentRepository.findById(appointmentId);
      
      if (!appointment) {
        throw new Error(`Cita no encontrada con ID: ${appointmentId}`);
      }
      
      appointment.complete();
      
      const updatedAppointment = await this.appointmentRepository.update(appointment);
      
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