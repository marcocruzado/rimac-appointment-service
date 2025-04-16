import { APIGatewayProxyHandler } from 'aws-lambda';
import * as mysql from 'mysql2/promise';
import middy from '@middy/core';
import jsonBodyParser from '@middy/http-json-body-parser';
import { CreateAppointmentDto } from '../../domain/entities/Appointment';
import { CreateAppointmentUseCase } from '../../application/usecases/CreateAppointmentUseCase';
import { MySQLAppointmentRepository } from '../../infrastructure/repositories/MySQLAppointmentRepository';
import { SNSMessageBroker } from '../../infrastructure/messaging/SNSMessageBroker';
import { AppointmentValidator } from '../../domain/validators/AppointmentValidator';
import { ValidationError } from '../../domain/errors/AppointmentError';
import { errorHandler } from '../middlewares/errorHandler';

const createConnections = async () => {
  const connections: { [key: string]: mysql.Connection } = {};
  
  connections['PE'] = await mysql.createConnection({
    host: process.env.MYSQL_HOST_PE,
    user: process.env.MYSQL_USER_PE,
    password: process.env.MYSQL_PASSWORD_PE,
    database: process.env.MYSQL_DATABASE_PE
  });

  connections['CL'] = await mysql.createConnection({
    host: process.env.MYSQL_HOST_CL,
    user: process.env.MYSQL_USER_CL,
    password: process.env.MYSQL_PASSWORD_CL,
    database: process.env.MYSQL_DATABASE_CL
  });

  return connections;
};

const createAppointmentHandler: APIGatewayProxyHandler = async (event) => {
  const data = event.body as unknown as CreateAppointmentDto;

  const validationErrors = AppointmentValidator.validateCreateAppointment(data);
  if (validationErrors.length > 0) {
    throw new ValidationError('Error de validación', validationErrors);
  }

  const connections = await createConnections();
  const repository = new MySQLAppointmentRepository(connections);
  const messageBroker = new SNSMessageBroker(process.env.SNS_TOPIC_ARN || '');
  const useCase = new CreateAppointmentUseCase(repository, messageBroker);

  const appointment = await useCase.execute(data);

  await Promise.all(Object.values(connections).map(conn => conn.end()));

  return {
    statusCode: 201,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify(appointment)
  };
};

export const handler = middy(createAppointmentHandler)
  .use(jsonBodyParser())
  .use(errorHandler()); 