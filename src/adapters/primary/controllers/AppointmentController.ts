import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { CreateAppointmentDto } from '../../../domain/entities/Appointment';
import { AppointmentService } from '../../../domain/ports/primary/AppointmentService';
import { CountryISO } from '../../../domain/entities/Appointment';

  
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  async createAppointment(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    try {
      if (!event.body) {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'El cuerpo de la solicitud es requerido' })
        };
      }

      const request = event.body as unknown as CreateAppointmentDto;
      
      const appointment = await this.appointmentService.createAppointment(request);
      
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



  async getAppointmentsByInsured(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    try {
      const insuredId = event.pathParameters?.insuredId;
      
      if (!insuredId) {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'El ID del asegurado es requerido' })
        };
      }
      
      const appointments = await this.appointmentService.getAppointments({ insuredId });
      
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          insuredId,
          appointments
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


  async processConfirmation(appointmentId: string): Promise<boolean> {
    try {
      await this.appointmentService.completeAppointment(appointmentId);
      return true;
    } catch (error) {
      console.error(`Error al procesar confirmación para cita ${appointmentId}:`, error);
      return false;
    }
  }


  async getAppointments(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    try {
      const insuredId = event.queryStringParameters?.insuredId;
      const countryIso = event.queryStringParameters?.countryIso as CountryISO | undefined;

      if (countryIso && !['PE', 'CL'].includes(countryIso)) {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            error: 'País no válido',
            message: 'El país debe ser PE o CL'
          })
        };
      }

      const appointments = await this.appointmentService.getAppointments({
        insuredId,
        countryIso
      });

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filters: {
            insuredId,
            countryIso
          },
          appointments
        })
      };
    } catch (error) {
      console.error('Error en getAppointments:', error);
      
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
}