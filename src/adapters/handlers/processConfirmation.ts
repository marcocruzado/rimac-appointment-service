import { SQSHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { CreateAppointmentUseCase } from '../../application/usecases/CreateAppointmentUseCase';
import { DynamoDBAppointmentRepository } from '../secondary/repositories/DynamoDBAppointmentRepository';
import { SNSMessageBroker } from '../../infrastructure/messaging/SNSMessageBroker';
import { AppointmentStatus } from '../../domain/entities/Appointment';

const dynamoClient = new DynamoDBClient({});
const dynamoDBClient = DynamoDBDocumentClient.from(dynamoClient);

export const handler: SQSHandler = async (event) => {
  try {
    const repository = new DynamoDBAppointmentRepository(
      dynamoDBClient,
      process.env.APPOINTMENTS_TABLE || 'appointments'
    );

    for (const record of event.Records) {
      try {
        const message = JSON.parse(record.body);
        const appointmentData = JSON.parse(message.Message);

        if (!appointmentData.id) {
          console.error('ID de cita no encontrado en el mensaje:', message);
          continue;
        }

        // Obtener la cita actual
        const appointment = await repository.findById(appointmentData.id);
        if (!appointment) {
          console.error(`Cita ${appointmentData.id} no encontrada`);
          continue;
        }

        // Actualizar el estado de la cita a CONFIRMED
        appointment.status = AppointmentStatus.CONFIRMED;
        appointment.updatedAt = new Date();
        await repository.update(appointment);

        console.log(`Cita ${appointmentData.id} actualizada a estado CONFIRMED`);
      } catch (error) {
        console.error('Error al procesar registro:', error);
      }
    }
  } catch (error) {
    console.error('Error procesando confirmaciones:', error);
    throw error;
  }
}; 