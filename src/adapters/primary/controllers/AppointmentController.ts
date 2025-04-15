import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { CreateAppointmentDto } from '../../../domain/entities/Appointment';
import { AppointmentService } from '../../../domain/ports/primary/AppointmentService';

/**
 * Controlador para las operaciones de citas médicas mediante API Gateway
 * Adaptador primario que maneja las solicitudes HTTP
 */
export class AppointmentController {
  /**
   * Constructor del controlador
   * @param appointmentService Servicio de citas
   */
  constructor(private readonly appointmentService: AppointmentService) {}

  /**
   * Crea una nueva cita médica
   * @param event Evento de API Gateway
   * @returns Respuesta HTTP con la cita creada
   */
  async createAppointment(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    try {
      // Validar que el cuerpo de la solicitud existe
      if (!event.body) {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'El cuerpo de la solicitud es requerido' })
        };
      }

      // Parsear el cuerpo de la solicitud
      const request = JSON.parse(event.body) as CreateAppointmentDto;
      
      // Crear la cita
      const appointment = await this.appointmentService.createAppointment(request);
      
      // Devolver respuesta exitosa
      return {
        statusCode: 201,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Agendamiento en proceso',
          appointment
        })
      };
    } catch (error) {
      console.error('Error en createAppointment:', error);
      
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Error al procesar la solicitud',
          message: error instanceof Error ? error.message : 'Error desconocido'
        })
      };
    }
  }

  /**
   * Obtiene las citas médicas de un asegurado
   * @param event Evento de API Gateway
   * @returns Respuesta HTTP con la lista de citas
   */
  async getAppointmentsByInsured(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    try {
      // Obtener el ID del asegurado de los parámetros de ruta
      const insuredId = event.pathParameters?.insuredId;
      
      // Validar que el ID del asegurado exista
      if (!insuredId) {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'El ID del asegurado es requerido' })
        };
      }
      
      // Obtener las citas
      const appointments = await this.appointmentService.getAppointmentsByInsured(insuredId);
      
      // Convertir a DTOs para la respuesta
      const appointmentDTOs = appointments;
      
      // Devolver respuesta exitosa
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          insuredId,
          appointments: appointmentDTOs
        })
      };
    } catch (error) {
      console.error('Error en getAppointmentsByInsured:', error);
      
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Error al procesar la solicitud',
          message: error instanceof Error ? error.message : 'Error desconocido'
        })
      };
    }
  }

  /**
   * Procesa la confirmación de una cita desde SQS
   * @param appointmentId ID de la cita a completar
   * @returns Resultado de la operación
   */
  async processConfirmation(appointmentId: string): Promise<boolean> {
    try {
      await this.appointmentService.completeAppointment(appointmentId);
      return true;
    } catch (error) {
      console.error(`Error al procesar confirmación para cita ${appointmentId}:`, error);
      return false;
    }
  }
}