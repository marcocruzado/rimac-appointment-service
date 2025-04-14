import { Appointment } from '../../domain/entities/Appointment';
import { AppointmentRepository } from '../../domain/ports/secondary/AppointmentRepository';

/**
 * Caso de uso para obtener las citas médicas de un asegurado
 * Implementa la lógica de negocio para buscar y listar citas
 */
export class GetAppointmentsByInsuredUseCase {
  /**
   * Constructor del caso de uso
   * @param appointmentRepository Repositorio de citas
   */
  constructor(
    private readonly appointmentRepository: AppointmentRepository
  ) {}

  /**
   * Ejecuta el caso de uso para obtener citas por asegurado
   * @param insuredId ID del asegurado
   * @returns Promesa con la lista de citas
   */
  async execute(insuredId: string): Promise<Appointment[]> {
    try {
      // Validar el ID del asegurado
      if (!insuredId || insuredId.length !== 5) {
        throw new Error('El ID del asegurado debe tener 5 dígitos');
      }

      // Obtener citas del repositorio
      const appointments = await this.appointmentRepository.findByInsuredId(insuredId);
      return appointments;
    } catch (error) {
      console.error(`Error al obtener citas para el asegurado ${insuredId}:`, error);
      throw error;
    }
  }
}