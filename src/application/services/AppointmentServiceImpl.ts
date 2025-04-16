import { Appointment, CountryISO, CreateAppointmentDto } from '../../domain/entities/Appointment';
import { AppointmentService, GetAppointmentsFilters } from '../../domain/ports/primary/AppointmentService';
import { CreateAppointmentUseCase } from '../usecases/CreateAppointmentUseCase';
import { GetAppointmentsUseCase } from '../usecases/GetAppointmentsUseCase';
import { ProcessAppointmentUseCase } from '../usecases/ProcessAppointmentUseCase';
import { CompleteAppointmentUseCase } from '../usecases/CompleteAppointmentUseCase';


export class AppointmentServiceImpl implements AppointmentService {

  constructor(
    private readonly createAppointmentUseCase: CreateAppointmentUseCase,
    private readonly getAppointmentsUseCase: GetAppointmentsUseCase,
    private readonly processAppointmentUseCase: ProcessAppointmentUseCase,
    private readonly completeAppointmentUseCase: CompleteAppointmentUseCase
  ) {}


  async createAppointment(request: CreateAppointmentDto): Promise<Appointment> {
    return this.createAppointmentUseCase.execute(request);
  }


  async getAppointments(filters?: GetAppointmentsFilters): Promise<Appointment[]> {
    return this.getAppointmentsUseCase.execute(filters);
  }


  async processAppointment(appointment: Appointment): Promise<boolean> {
    return this.processAppointmentUseCase.execute(appointment);
  }


  async completeAppointment(appointmentId: string): Promise<Appointment> {
    return this.completeAppointmentUseCase.execute(appointmentId);
  }
}