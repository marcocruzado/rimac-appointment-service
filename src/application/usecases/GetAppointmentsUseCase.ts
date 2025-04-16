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
      if (!filters) {
        return this.appointmentRepository.findAll();
      }

      const { insuredId, countryIso } = filters;

      if (insuredId && countryIso) {
        return this.appointmentRepository.findByInsuredIdAndCountry(insuredId, countryIso);
      }

      if (insuredId) {
        return this.appointmentRepository.findByInsuredId(insuredId);
      }

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