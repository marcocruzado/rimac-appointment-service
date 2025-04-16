import { Appointment, CountryISO, CreateAppointmentDto } from '../../domain/entities/Appointment';
import { AppointmentService, GetAppointmentsFilters } from '../../domain/ports/primary/AppointmentService';
import { CreateAppointmentUseCase } from '../usecases/CreateAppointmentUseCase';
import { GetAppointmentsUseCase } from '../usecases/GetAppointmentsUseCase';
import { ProcessAppointmentUseCase } from '../usecases/ProcessAppointmentUseCase';
import { CompleteAppointmentUseCase } from '../usecases/CompleteAppointmentUseCase';

/**
 * Implementación del servicio de citas médicas
 * Actúa como orquestador entre los puertos primarios y los casos de uso
 */
export class AppointmentServiceImpl implements AppointmentService {
  /**
   * Constructor del servicio de citas
   * @param createAppointmentUseCase Caso de uso para crear citas
   * @param getAppointmentsUseCase Caso de uso para obtener citas
   * @param processAppointmentUseCase Caso de uso para procesar citas
   * @param completeAppointmentUseCase Caso de uso para completar citas
   */
  constructor(
    private readonly createAppointmentUseCase: CreateAppointmentUseCase,
    private readonly getAppointmentsUseCase: GetAppointmentsUseCase,
    private readonly processAppointmentUseCase: ProcessAppointmentUseCase,
    private readonly completeAppointmentUseCase: CompleteAppointmentUseCase
  ) {}

  /**
   * Crea una nueva cita médica
   * @param request Datos para crear la cita
   * @returns Promesa con la cita creada
   */
  async createAppointment(request: CreateAppointmentDto): Promise<Appointment> {
    return this.createAppointmentUseCase.execute(request);
  }

  /**
   * Obtiene todas las citas de un asegurado
   * @param filters Filtros para obtener citas
   * @returns Promesa con la lista de citas
   */
  async getAppointments(filters?: GetAppointmentsFilters): Promise<Appointment[]> {
    return this.getAppointmentsUseCase.execute(filters);
  }

  /**
   * Procesa una cita para un país específico (PE o CL)
   * @param appointment Cita a procesar
   * @returns Promesa que indica si se procesó correctamente
   */
  async processAppointment(appointment: Appointment): Promise<boolean> {
    return this.processAppointmentUseCase.execute(appointment);
  }

  /**
   * Completa el procesamiento de una cita
   * @param appointmentId ID de la cita a completar
   * @returns Promesa con la cita actualizada
   */
  async completeAppointment(appointmentId: string): Promise<Appointment> {
    return this.completeAppointmentUseCase.execute(appointmentId);
  }
}