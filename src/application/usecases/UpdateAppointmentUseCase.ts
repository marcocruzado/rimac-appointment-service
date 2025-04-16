import { AppointmentRepository } from '../../domain/repositories/AppointmentRepository';
import { AppointmentError } from '../../domain/errors/AppointmentError';
import { Appointment, CountryISO } from '../../domain/entities/Appointment';

export interface UpdateAppointmentParams {
  appointmentId: string;
  country: string;
  status?: string;
}

export class UpdateAppointmentUseCase {
  constructor(
    private readonly appointmentRepository: AppointmentRepository
  ) {}

  async execute(params: UpdateAppointmentParams): Promise<Appointment> {
    const { appointmentId, country, status } = params;

    try {
      const appointment = await this.appointmentRepository.findById(appointmentId, country as CountryISO);
      
      if (!appointment) {
        throw new AppointmentError(
          'APPOINTMENT_NOT_FOUND',
          `No se encontró la cita con ID: ${appointmentId}`,
          404
        );
      }

      if (status) {
        switch (status) {
          case 'COMPLETED':
            appointment.complete();
            break;
          case 'CANCELLED':
            appointment.cancel();
            break;
          case 'CONFIRMED':
            appointment.confirm();
            break;
          default:
            throw new AppointmentError(
              'INVALID_STATUS',
              'Estado de cita inválido',
              400
            );
        }
      }

      await this.appointmentRepository.update(appointment);
      return appointment;
    } catch (error) {
      if (error instanceof AppointmentError) {
        throw error;
      }
      throw new AppointmentError(
        'UPDATE_APPOINTMENT_ERROR',
        'Error al actualizar la cita',
        500
      );
    }
  }
} 