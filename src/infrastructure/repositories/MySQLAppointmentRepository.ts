import { Connection } from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid';
import { Appointment, AppointmentStatus, CreateAppointmentDto } from '../../domain/entities/Appointment';
import { AppointmentRepository } from '../../domain/repositories/AppointmentRepository';

export class MySQLAppointmentRepository implements AppointmentRepository {
  constructor(private readonly connections: { [key: string]: Connection }) { }

  private getTableName(countryIso: string): string {
    return `appointments_${countryIso.toLowerCase()}`;
  }

  async create(data: CreateAppointmentDto): Promise<Appointment> {
    const connection = this.connections[data.countryIso];
    const tableName = this.getTableName(data.countryIso);
    const id = uuidv4();

    const [result] = await connection.execute(
      `INSERT INTO ${tableName} (id, insured_id, schedule_id, country_iso, status) 
        VALUES (?, ?, ?, ?, ?)`,
      [id, data.insuredId, data.scheduleId, data.countryIso, AppointmentStatus.PENDING]
    );

    return new Appointment(
      id,
      data.insuredId,
      data.scheduleId,
      data.countryIso,
      AppointmentStatus.PENDING,
      new Date(),
      new Date());
  }

  async findById(id: string, countryIso: 'PE' | 'CL'): Promise<Appointment | null> {
    const connection = this.connections[countryIso];
    const tableName = this.getTableName(countryIso);

    const [rows] = await connection.execute(
      `SELECT * FROM ${tableName} WHERE id = ?`,
      [id]
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return null;
    }

    const row = rows[0] as any;
    return new Appointment(
      row.id,
      row.insured_id,
      row.schedule_id,
      row.country_iso as 'PE' | 'CL',
      row.status as AppointmentStatus,
      new Date(row.created_at),
      new Date(row.updated_at));
  }

  async findByInsuredId(insuredId: string, countryIso: 'PE' | 'CL'): Promise<Appointment[]> {
    const connection = this.connections[countryIso];
    const tableName = this.getTableName(countryIso);

    const [rows] = await connection.execute(
      `SELECT * FROM ${tableName} WHERE insured_id = ?`,
      [insuredId]
    );

    if (!Array.isArray(rows)) {
      return [];
    }

    return rows.map((row: any) => new Appointment(
      row.id,
      row.insured_id,
      row.schedule_id,
      row.country_iso as 'PE' | 'CL',
      row.status as AppointmentStatus,
      new Date(row.created_at), new Date(row.updated_at)));
  }

  async update(appointment: Appointment): Promise<void> {
    const connection = this.connections[appointment.countryIso];
    const tableName = this.getTableName(appointment.countryIso);

    await connection.execute(
      `UPDATE ${tableName} 
       SET status = ?, schedule_id = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [appointment.status, appointment.scheduleId, appointment.id]
    );
  }

  async delete(id: string, countryIso: 'PE' | 'CL'): Promise<void> {
    const connection = this.connections[countryIso];
    const tableName = this.getTableName(countryIso);

    await connection.execute(
      `DELETE FROM ${tableName} WHERE id = ?`,
      [id]
    );
  }
} 