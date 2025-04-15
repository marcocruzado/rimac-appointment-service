import * as mysql from 'mysql2/promise';
import { Appointment } from '../../../domain/entities/Appointment';
import { CountryAppointmentRepository } from '../../../domain/ports/secondary/CountryAppointmentRepository';

/**
 * Implementación del repositorio de citas específico por país en MySQL
 * Adaptador secundario que implementa las operaciones de persistencia en RDS
 */
export class MySQLCountryAppointmentRepository implements CountryAppointmentRepository {
  /**
   * Constructor del repositorio
   * @param dbConnection Conexión a la base de datos MySQL
   * @param tableName Nombre de la tabla en MySQL
   */
  constructor(
    private readonly dbConnection: mysql.Pool,
    private readonly tableName: string
  ) {}

  /**
   * Guarda una cita en la base de datos específica del país
   * @param appointment La cita a guardar
   * @returns Promesa con el resultado de la operación
   */
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