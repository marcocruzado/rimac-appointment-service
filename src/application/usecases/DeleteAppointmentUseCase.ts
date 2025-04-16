import { AppointmentRepository } from '../../domain/repositories/AppointmentRepository';
import { AppointmentError } from '../../domain/errors/AppointmentError';
import { CountryISO } from '../../domain/entities/Appointment';

export class DeleteAppointmentUseCase {
  constructor(
    private readonly appointmentRepository: AppointmentRepository
  ) {}

  async execute(id: string, countryIso: CountryISO): Promise<void> {
    try {
      // Verificar si la cita existe
      const appointment = await this.appointmentRepository.findById(id, countryIso);
      
      if (!appointment) {
        throw new AppointmentError(
          'APPOINTMENT_NOT_FOUND',
          `No se encontró la cita con ID: ${id}`,
          404
        );
      }

      // Eliminar la cita
      await this.appointmentRepository.delete(id, countryIso);
    } catch (error) {
      if (error instanceof AppointmentError) {
        throw error;
      }
      console.error(`Error al eliminar la cita ${id}:`, error);
      throw new AppointmentError(
        'DELETE_APPOINTMENT_ERROR',
        'Error al eliminar la cita',
        500
      );
    }
  }
} 