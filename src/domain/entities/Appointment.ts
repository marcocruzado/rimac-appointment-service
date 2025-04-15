/**
 * Representación de los estados posibles de una cita médica
 */
export enum AppointmentStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    CANCELLED = 'CANCELLED',
    COMPLETED = 'COMPLETED'
  }
  
  /**
   * Identificador de países válidos para el sistema
   */
  export type CountryISO = 'PE' | 'CL';
  
  /**
   * Entidad de dominio para la cita médica
   * Representa la estructura principal del negocio
   */
  export class Appointment {
    constructor(
      public readonly id: string,
      public readonly insuredId: string,
      public readonly scheduleId: string,
      public readonly countryIso: CountryISO,
      public status: AppointmentStatus = AppointmentStatus.PENDING,
      public readonly createdAt: Date = new Date(),
      public updatedAt: Date = new Date()
    ) {}

    toDTO(): AppointmentDTO {
      return {
        id: this.id,
        insuredId: this.insuredId,
        scheduleId: Number(this.scheduleId),
        countryISO: this.countryIso,
        status: this.status,
        createdAt: this.createdAt.toISOString(),
        updatedAt: this.updatedAt.toISOString()
      };
    }

    static fromDTO(dto: AppointmentDTO): Appointment {
      return new Appointment(
        dto.id,
        dto.insuredId,
        String(dto.scheduleId),
        dto.countryISO as CountryISO,
        dto.status as AppointmentStatus,
        new Date(dto.createdAt),
        new Date(dto.updatedAt)
      );
    }

    complete(): void {
      this.status = AppointmentStatus.COMPLETED;
      this.updatedAt = new Date();
    }

    cancel(): void {
      this.status = AppointmentStatus.CANCELLED;
      this.updatedAt = new Date();
    }

    confirm(): void {
      this.status = AppointmentStatus.CONFIRMED;
      this.updatedAt = new Date();
    }
  }
  
  /**
   * Interfaz para el objeto de transferencia de datos (DTO)
   */
  export interface AppointmentDTO {
    id: string;
    insuredId: string;
    scheduleId: number;
    countryISO: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  }
  
  /**
   * Interfaz para la solicitud de creación de cita
   */
  export interface CreateAppointmentDto {
    insuredId: string;
    scheduleId: string;
    countryIso: CountryISO;
  }