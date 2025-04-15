import { APIGatewayProxyHandler } from 'aws-lambda';
import * as mysql from 'mysql2/promise';
import middy from '@middy/core';
import jsonBodyParser from '@middy/http-json-body-parser';
import { CreateAppointmentDto } from '../../domain/entities/Appointment';
import { CreateAppointmentUseCase } from '../../application/usecases/CreateAppointmentUseCase';
import { MySQLAppointmentRepository } from '../../infrastructure/repositories/MySQLAppointmentRepository';
import { SNSMessageBroker } from '../../infrastructure/messaging/SNSMessageBroker';

// Configuración de conexiones MySQL
const connections: { [key: string]: mysql.Connection } = {};

const createAppointmentHandler: APIGatewayProxyHandler = async (event) => {
  try {
    const data = JSON.parse(event.body || '{}') as CreateAppointmentDto;

    // Validar datos requeridos
    if (!data.insuredId || !data.scheduleId || !data.countryIso) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Faltan datos requeridos: insuredId, scheduleId, countryIso'
        })
      };
    }

    // Validar país
    if (!['PE', 'CL'].includes(data.countryIso)) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'País no válido. Debe ser PE o CL'
        })
      };
    }

    // Crear conexiones si no existen
    if (!connections['PE']) {
      connections['PE'] = await mysql.createConnection({
        host: process.env.MYSQL_HOST_PE,
        user: process.env.MYSQL_USER_PE,
        password: process.env.MYSQL_PASSWORD_PE,
        database: process.env.MYSQL_DATABASE_PE
      });
    }

    if (!connections['CL']) {
      connections['CL'] = await mysql.createConnection({
        host: process.env.MYSQL_HOST_CL,
        user: process.env.MYSQL_USER_CL,
        password: process.env.MYSQL_PASSWORD_CL,
        database: process.env.MYSQL_DATABASE_CL
      });
    }

    // Crear instancias
    const repository = new MySQLAppointmentRepository(connections);
    const messageBroker = new SNSMessageBroker(process.env.SNS_TOPIC_ARN || '');
    const useCase = new CreateAppointmentUseCase(repository,messageBroker);

    // Ejecutar caso de uso
    const appointment = await useCase.execute(data);

    return {
      statusCode: 201,
      body: JSON.stringify(appointment)
    };

  } catch (error: any) {
    console.error('Error al crear cita:', error);
    
    return {
      statusCode: error.message?.includes('ya tiene una cita pendiente') ? 409 : 500,
      body: JSON.stringify({
        message: error.message || 'Error interno del servidor'
      })
    };
  }
};

// Agregar middleware para parsear el body JSON
export const handler = middy(createAppointmentHandler)
  .use(jsonBodyParser()); 