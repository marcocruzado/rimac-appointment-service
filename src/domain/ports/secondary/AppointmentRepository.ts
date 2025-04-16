import { Appointment, CountryISO } from '../../entities/Appointment';


export interface AppointmentRepository {
  save(appointment: Appointment): Promise<Appointment>;
  findById(id: string): Promise<Appointment | null>;
  findByInsuredId(insuredId: string): Promise<Appointment[]>;
  findByCountry(countryIso: CountryISO): Promise<Appointment[]>;
  findByCountry(countryIso: CountryISO): Promise<Appointment[]>;
  findByInsuredIdAndCountry(insuredId: string, countryIso: CountryISO): Promise<Appointment[]>;
  findAll(): Promise<Appointment[]>;
  findAll(): Promise<Appointment[]>;
  update(appointment: Appointment): Promise<Appointment>;
  update(appointment: Appointment): Promise<Appointment>;
}