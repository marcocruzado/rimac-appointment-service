import { Appointment, CountryISO, CreateAppointmentDto } from '../../entities/Appointment';

export interface GetAppointmentsFilters {
  insuredId?: string;
  countryIso?: CountryISO;
}


export interface AppointmentService {

  createAppointment(request: CreateAppointmentDto): Promise<Appointment>;
  getAppointments(filters?: GetAppointmentsFilters): Promise<Appointment[]>;
  processAppointment(appointment: Appointment): Promise<boolean>;
  processAppointment(appointment: Appointment): Promise<boolean>;
  completeAppointment(appointmentId: string): Promise<Appointment>;
}