import { AppointmentRepository } from '../../domain/repositories/AppointmentRepository';
import { AppointmentError } from '../../domain/errors/AppointmentError';
import { Appointment, CountryISO } from '../../domain/entities/Appointment';

export interface GetAppointmentParams {
  appointmentId: string;
  country: string;
}

export class GetAppointmentUseCase {
  constructor(
    private readonly appointmentRepository: AppointmentRepository
  ) {}

  async execute(params: GetAppointmentParams): Promise<Appointment> {
    const { appointmentId, country } = params;
    const appointment = await this.appointmentRepository.findById(appointmentId, country as CountryISO);
    
    if (!appointment) {
      throw new AppointmentError(
        'APPOINTMENT_NOT_FOUND',
        `No se encontró la cita con ID: ${appointmentId}`,
        404
      );
    }

    return appointment;
  }
} 