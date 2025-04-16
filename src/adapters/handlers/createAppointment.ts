import { APIGatewayProxyHandler } from 'aws-lambda';
import * as mysql from 'mysql2/promise';
import middy from '@middy/core';
import jsonBodyParser from '@middy/http-json-body-parser';
import { CreateAppointmentDto } from '../../domain/entities/Appointment';
import { CreateAppointmentUseCase } from '../../application/usecases/CreateAppointmentUseCase';
import { MySQLAppointmentRepository } from '../../infrastructure/repositories/MySQLAppointmentRepository';
import { SNSMessageBroker } from '../../infrastructure/messaging/SNSMessageBroker';
import { SNSClient } from '@aws-sdk/client-sns';

const connections: { [key: string]: mysql.Connection } = {};

const createAppointmentHandler: APIGatewayProxyHandler = async (event) => {
  try {
    const data = event.body as unknown as CreateAppointmentDto;

    console.error(data)
    if (!data.insuredId || !data.scheduleId || !data.countryIso) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Faltan datos requeridos: insuredId, scheduleId, countryIso'
        })
      };
    }

    if (!['PE', 'CL'].includes(data.countryIso)) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'País no válido. Debe ser PE o CL'
        })
      };
    }

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

    const repository = new MySQLAppointmentRepository(connections);
    const snsClient = new SNSClient({});
    const messageBroker = new SNSMessageBroker(snsClient);
    const useCase = new CreateAppointmentUseCase(repository, messageBroker);

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

export const handler = middy(createAppointmentHandler)
  .use(jsonBodyParser()); 