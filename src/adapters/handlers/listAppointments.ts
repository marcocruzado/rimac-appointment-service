import { APIGatewayProxyHandler } from 'aws-lambda';
import middy from '@middy/core';
import { DynamoDB } from 'aws-sdk';
import { ValidationError } from '../../domain/errors/AppointmentError';
import { errorHandler } from '../middlewares/errorHandler';

const dynamoDB = new DynamoDB.DocumentClient();

const listAppointmentsHandler: APIGatewayProxyHandler = async (event) => {
  const { insuredId } = event.pathParameters || {};

  if (!insuredId || !/^\d{5}$/.test(insuredId)) {
    throw new ValidationError('El insuredId debe tener exactamente 5 dígitos');
  }

  const params = {
    TableName: process.env.APPOINTMENTS_TABLE || '',
    IndexName: 'insuredId-index',
    KeyConditionExpression: 'insuredId = :insuredId',
    ExpressionAttributeValues: {
      ':insuredId': insuredId
    }
  };

  const result = await dynamoDB.query(params).promise();

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify({
      appointments: result.Items
    })
  };
};

export const handler = middy(listAppointmentsHandler)
  .use(errorHandler()); 