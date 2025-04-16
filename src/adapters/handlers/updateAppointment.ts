import { APIGatewayProxyHandler } from 'aws-lambda';
import * as mysql from 'mysql2/promise';
import middy from '@middy/core';
import jsonBodyParser from '@middy/http-json-body-parser';
import { MySQLAppointmentRepository } from '../../infrastructure/repositories/MySQLAppointmentRepository';
import { UpdateAppointmentUseCase } from '../../application/usecases/UpdateAppointmentUseCase';
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

const updateAppointmentHandler: APIGatewayProxyHandler = async (event) => {
  const { appointmentId, country } = event.pathParameters || {};
  const appointmentData = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;

  const validationErrors = AppointmentValidator.validateCreateAppointment({ appointmentId, country, ...appointmentData });
  if (validationErrors.length > 0) {
    throw new ValidationError('Error de validación', validationErrors);
  }

  const connections = await createConnections();
  const repository = new MySQLAppointmentRepository(connections);
  const useCase = new UpdateAppointmentUseCase(repository);

  const appointment = await useCase.execute({ appointmentId: appointmentId!, country: country!, ...appointmentData });

  await Promise.all(Object.values(connections).map(conn => conn.end()));

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify(appointment)
  };
};

export const handler = middy(updateAppointmentHandler)
  .use(jsonBodyParser())
  .use(errorHandler()); 