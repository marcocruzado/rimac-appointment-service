import { Appointment } from '../../domain/entities/Appointment';
import { AppointmentRepository } from '../../domain/ports/secondary/AppointmentRepository';


export class GetAppointmentsByInsuredUseCase {

  constructor(
    private readonly appointmentRepository: AppointmentRepository
  ) {}


  async execute(insuredId: string): Promise<Appointment[]> {
    try {
      if (!insuredId || insuredId.length !== 5) {
        throw new Error('El ID del asegurado debe tener 5 dígitos');
      }

      const appointments = await this.appointmentRepository.findByInsuredId(insuredId);
      return appointments;
    } catch (error) {
      console.error(`Error al obtener citas para el asegurado ${insuredId}:`, error);
      throw error;
    }
  }
}