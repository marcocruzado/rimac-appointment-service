import { Appointment } from '../../entities/Appointment';

export interface CountryAppointmentRepository {
  saveAppointment(appointment: Appointment): Promise<boolean>;
}