import { Appointment, CountryISO } from '../../domain/entities/Appointment';
import { AppointmentRepository } from '../../domain/ports/secondary/AppointmentRepository';

interface GetAppointmentsFilters {
  insuredId?: string;
  countryIso?: CountryISO;
}

export class GetAppointmentsUseCase {
  constructor(
    private readonly appointmentRepository: AppointmentRepository
  ) {}

  async execute(filters?: GetAppointmentsFilters): Promise<Appointment[]> {
    try {
      // Si no hay filtros, obtener todas las citas
      if (!filters) {
        return this.appointmentRepository.findAll();
      }

      const { insuredId, countryIso } = filters;

      // Si tenemos ambos filtros
      if (insuredId && countryIso) {
        return this.appointmentRepository.findByInsuredIdAndCountry(insuredId, countryIso);
      }

      // Si solo tenemos insuredId
      if (insuredId) {
        return this.appointmentRepository.findByInsuredId(insuredId);
      }

      // Si solo tenemos countryIso
      if (countryIso) {
        return this.appointmentRepository.findByCountry(countryIso);
      }

      return [];
    } catch (error) {
      console.error('Error al obtener citas:', error);
      throw error;
    }
  }
} 