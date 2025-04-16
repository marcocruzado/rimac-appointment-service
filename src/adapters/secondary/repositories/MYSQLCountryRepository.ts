import * as mysql from 'mysql2/promise';
import { Appointment } from '../../../domain/entities/Appointment';
import { CountryAppointmentRepository } from '../../../domain/ports/secondary/CountryAppointmentRepository';


export class MySQLCountryAppointmentRepository implements CountryAppointmentRepository {

  constructor(
    private readonly dbConnection: mysql.Pool,
    private readonly tableName: string
  ) {}


  async saveAppointment(appointment: Appointment): Promise<boolean> {
    try {
      const query = `
        INSERT INTO ${this.tableName} (
          appointment_id, 
          insured_id, 
          schedule_id, 
          country_iso, 
          status, 
          created_at, 
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      const params = [
        appointment.id,
        appointment.insuredId,
        appointment.scheduleId,
        appointment.countryIso,
        appointment.status,
        appointment.createdAt,
        appointment.updatedAt
      ];
      
      const [result] = await this.dbConnection.execute(query, params);
      return true;
    } catch (error) {
      console.error(`Error al guardar cita en MySQL para el país ${appointment.countryIso}:`, error);
      return false;
    }
  }
}