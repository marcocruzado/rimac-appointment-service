import { Appointment, CreateAppointmentDto } from '../entities/Appointment';

export interface AppointmentRepository {
  create(data: CreateAppointmentDto): Promise<Appointment>;
  findById(id: string, countryIso: 'PE' | 'CL'): Promise<Appointment | null>;
  findByInsuredId(insuredId: string, countryIso: 'PE' | 'CL'): Promise<Appointment[]>;
  update(appointment: Appointment): Promise<void>;
  delete(id: string, countryIso: 'PE' | 'CL'): Promise<void>;
} 