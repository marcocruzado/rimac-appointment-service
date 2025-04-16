import middy from '@middy/core';
import { AppointmentError, ValidationError } from '../../domain/errors/AppointmentError';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

interface ErrorResponse {
  message: string;
  code?: string;
  errors?: string[];
}

export const errorHandler = (): middy.MiddlewareObj<APIGatewayProxyEvent, APIGatewayProxyResult> => {
  return {
    onError: async (handler): Promise<void> => {
      const { error } = handler;

      console.error('Error capturado:', {
        name: error?.name,
        message: error?.message,
        stack: error?.stack,
      });

      let statusCode = 500;
      const response: ErrorResponse = {
        message: 'Error interno del servidor'
      };

      if (error instanceof AppointmentError) {
        statusCode = error.statusCode;
        response.message = error.message;
        response.code = error.code;
      }

      // Si es un error de validación, incluir los errores detallados
      if (error instanceof ValidationError && Array.isArray(error.errors)) {
        response.errors = error.errors;
      }

      handler.response = {
        statusCode,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify(response)
      };
    }
  };
}; 