import { APIGatewayProxyHandler } from 'aws-lambda';
import * as mysql from 'mysql2/promise';
import middy from '@middy/core';
import { MySQLAppointmentRepository } from '../../infrastructure/repositories/MySQLAppointmentRepository';
import { DeleteAppointmentUseCase } from '../../application/usecases/DeleteAppointmentUseCase';
import { AppointmentValidator } from '../../domain/validators/AppointmentValidator';
import { ValidationError } from '../../domain/errors/AppointmentError';
import { errorHandler } from '../middlewares/errorHandler';
import { CountryISO } from '../../domain/entities/Appointment';

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

const deleteAppointmentHandler: APIGatewayProxyHandler = async (event) => {
  const { appointmentId, country } = event.pathParameters || {};

  if (!appointmentId || !country) {
    throw new ValidationError('Error de validación', ['appointmentId y country son requeridos']);
  }

  const connections = await createConnections();
  const repository = new MySQLAppointmentRepository(connections);
  const useCase = new DeleteAppointmentUseCase(repository);

  await useCase.execute(appointmentId!, country as CountryISO);
  await Promise.all(Object.values(connections).map(conn => conn.end()));

  return {
    statusCode: 204,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: ''
  };
};

export const handler = middy(deleteAppointmentHandler)
  .use(errorHandler()); 