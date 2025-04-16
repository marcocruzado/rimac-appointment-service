import { Appointment, CountryISO, CreateAppointmentDto } from '../../entities/Appointment';

export interface GetAppointmentsFilters {
  insuredId?: string;
  countryIso?: CountryISO;
}

/**
 * Puerto primario que define los servicios de citas médicas
 * Define el contrato que debe cumplir cualquier servicio de citas
 */
export interface AppointmentService {
  /**
   * Crea una nueva cita médica
   * @param request Datos para crear la cita
   * @returns Promesa con la cita creada
   */
  createAppointment(request: CreateAppointmentDto): Promise<Appointment>;
  
  /**
   * Obtiene citas médicas con filtros opcionales
   * @param filters Filtros opcionales (insuredId y/o countryIso)
   * @returns Promesa con la lista de citas
   */
  getAppointments(filters?: GetAppointmentsFilters): Promise<Appointment[]>;
  
  /**
   * Procesa una cita para un país específico (PE o CL)
   * @param appointment Cita a procesar
   * @returns Promesa que indica si se procesó correctamente
   */
  processAppointment(appointment: Appointment): Promise<boolean>;
  
  /**
   * Completa el procesamiento de una cita
   * @param appointmentId ID de la cita a completar
   * @returns Promesa con la cita actualizada
   */
  completeAppointment(appointmentId: string): Promise<Appointment>;
}