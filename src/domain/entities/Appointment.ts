/**
 * Representación de los estados posibles de una cita médica
 */
export enum AppointmentStatus {
    PENDING = 'pending',
    COMPLETED = 'completed',
    FAILED = 'failed'
  }
  
  /**
   * Identificador de países válidos para el sistema
   */
  export enum CountryISO {
    PERU = 'PE',
    CHILE = 'CL'
  }
  
  /**
   * Entidad de dominio para la cita médica
   * Representa la estructura principal del negocio
   */
  export class Appointment {
    id: string;
    insuredId: string;
    scheduleId: number;
    countryISO: CountryISO;
    status: AppointmentStatus;
    createdAt: Date;
    updatedAt: Date;
  
    constructor(
      id: string,
      insuredId: string,
      scheduleId: number,
      countryISO: CountryISO,
      status: AppointmentStatus = AppointmentStatus.PENDING,
      createdAt: Date = new Date(),
      updatedAt: Date = new Date()
    ) {
      // Validaciones de dominio
      if (!insuredId || insuredId.length !== 5) {
        throw new Error('El ID del asegurado debe tener 5 dígitos');
      }
  
      if (!scheduleId || scheduleId <= 0) {
        throw new Error('El ID de horario debe ser un número positivo');
      }
  
      if (!Object.values(CountryISO).includes(countryISO)) {
        throw new Error('El país debe ser PE o CL');
      }
  
      this.id = id;
      this.insuredId = insuredId;
      this.scheduleId = scheduleId;
      this.countryISO = countryISO;
      this.status = status;
      this.createdAt = createdAt;
      this.updatedAt = updatedAt;
    }
  
    /**
     * Actualiza el estado de la cita a completada
     */
    complete(): void {
      this.status = AppointmentStatus.COMPLETED;
      this.updatedAt = new Date();
    }
  
    /**
     * Actualiza el estado de la cita a fallida
     */
    fail(): void {
      this.status = AppointmentStatus.FAILED;
      this.updatedAt = new Date();
    }
  
    /**
     * Verifica si la cita está pendiente
     */
    isPending(): boolean {
      return this.status === AppointmentStatus.PENDING;
    }
  
    /**
     * Verifica si la cita está completada
     */
    isCompleted(): boolean {
      return this.status === AppointmentStatus.COMPLETED;
    }
  
    /**
     * Método para crear la representación de datos transferible
     */
    toDTO(): AppointmentDTO {
      return {
        id: this.id,
        insuredId: this.insuredId,
        scheduleId: this.scheduleId,
        countryISO: this.countryISO,
        status: this.status,
        createdAt: this.createdAt.toISOString(),
        updatedAt: this.updatedAt.toISOString()
      };
    }
  
    /**
     * Método de fábrica para crear una instancia desde un DTO
     */
    static fromDTO(dto: AppointmentDTO): Appointment {
      return new Appointment(
        dto.id,
        dto.insuredId,
        dto.scheduleId,
        dto.countryISO as CountryISO,
        dto.status as AppointmentStatus,
        new Date(dto.createdAt),
        new Date(dto.updatedAt)
      );
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
  export interface CreateAppointmentRequest {
    insuredId: string;
    scheduleId: number;
    countryISO: string;
  }