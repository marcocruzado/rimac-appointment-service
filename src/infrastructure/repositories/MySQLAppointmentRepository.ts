import { Connection } from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid';
import { Appointment, AppointmentStatus, CountryISO, CreateAppointmentDto } from '../../domain/entities/Appointment';
import { AppointmentRepository } from '../../domain/ports/secondary/AppointmentRepository';

export class MySQLAppointmentRepository implements AppointmentRepository {
  constructor(private readonly connections: { [key: string]: Connection }) {}

  private getTableName(countryIso: CountryISO): string {
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

  async findById(id: string): Promise<Appointment | null> {
    // Buscar en ambas bases de datos
    for (const countryIso of ['PE', 'CL'] as CountryISO[]) {
      const connection = this.connections[countryIso];
      const tableName = this.getTableName(countryIso);

      const [rows] = await connection.execute(
        `SELECT * FROM ${tableName} WHERE id = ?`,
        [id]
      );

      if (Array.isArray(rows) && rows.length > 0) {
        const row = rows[0] as any;
        return new Appointment(
          row.id,
          row.insured_id,
          row.schedule_id,
          row.country_iso as CountryISO,
          row.status as AppointmentStatus,
          new Date(row.created_at),
          new Date(row.updated_at)
        );
      }
    }

    return null;
  }

  async findByInsuredId(insuredId: string): Promise<Appointment[]> {
    const appointments: Appointment[] = [];
    
    // Buscar en ambas bases de datos
    for (const countryIso of ['PE', 'CL'] as CountryISO[]) {
      const connection = this.connections[countryIso];
      const tableName = this.getTableName(countryIso);

      const [rows] = await connection.execute(
        `SELECT * FROM ${tableName} WHERE insured_id = ?`,
        [insuredId]
      );

      if (Array.isArray(rows)) {
        const countryAppointments = rows.map((row: any) => new Appointment(
          row.id,
          row.insured_id,
          row.schedule_id,
          row.country_iso as CountryISO,
          row.status as AppointmentStatus,
          new Date(row.created_at),
          new Date(row.updated_at)
        ));
        appointments.push(...countryAppointments);
      }
    }

    return appointments;
  }

  async findByCountry(countryIso: CountryISO): Promise<Appointment[]> {
    const connection = this.connections[countryIso];
    const tableName = this.getTableName(countryIso);

    const [rows] = await connection.execute(
      `SELECT * FROM ${tableName}`
    );

    if (!Array.isArray(rows)) {
      return [];
    }

    return rows.map((row: any) => new Appointment(
      row.id,
      row.insured_id,
      row.schedule_id,
      row.country_iso as CountryISO,
      row.status as AppointmentStatus,
      new Date(row.created_at),
      new Date(row.updated_at)
    ));
  }

  async findByInsuredIdAndCountry(insuredId: string, countryIso: CountryISO): Promise<Appointment[]> {
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
      row.country_iso as CountryISO,
      row.status as AppointmentStatus,
      new Date(row.created_at),
      new Date(row.updated_at)
    ));
  }

  async findAll(): Promise<Appointment[]> {
    const appointments: Appointment[] = [];
    
    // Buscar en ambas bases de datos
    for (const countryIso of ['PE', 'CL'] as CountryISO[]) {
      const connection = this.connections[countryIso];
      const tableName = this.getTableName(countryIso);

      const [rows] = await connection.execute(
        `SELECT * FROM ${tableName}`
      );

      if (Array.isArray(rows)) {
        const countryAppointments = rows.map((row: any) => new Appointment(
          row.id,
          row.insured_id,
          row.schedule_id,
          row.country_iso as CountryISO,
          row.status as AppointmentStatus,
          new Date(row.created_at),
          new Date(row.updated_at)
        ));
        appointments.push(...countryAppointments);
      }
    }

    return appointments;
  }

  async update(appointment: Appointment): Promise<Appointment> {
    const connection = this.connections[appointment.countryIso];
    const tableName = this.getTableName(appointment.countryIso);

    await connection.execute(
      `UPDATE ${tableName} SET status = ?, updated_at = ? WHERE id = ?`,
      [appointment.status, appointment.updatedAt, appointment.id]
    );

    return appointment;
  }

  async delete(id: string, countryIso: CountryISO): Promise<void> {
    const connection = this.connections[countryIso];
    const tableName = this.getTableName(countryIso);

    await connection.execute(
      `DELETE FROM ${tableName} WHERE id = ?`,
      [id]
    );
  }

  async save(appointment: Appointment): Promise<Appointment> {
    const connection = this.connections[appointment.countryIso];
    const tableName = this.getTableName(appointment.countryIso);

    await connection.execute(
      `INSERT INTO ${tableName} (id, insured_id, schedule_id, country_iso, status, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        appointment.id,
        appointment.insuredId,
        appointment.scheduleId,
        appointment.countryIso,
        appointment.status,
        appointment.createdAt,
        appointment.updatedAt
      ]
    );

    return appointment;
  }
} 