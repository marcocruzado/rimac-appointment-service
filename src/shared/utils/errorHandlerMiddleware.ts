import middy from '@middy/core';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

/**
 * Middleware para manejar errores en funciones Lambda
 * Proporciona un formato estándar para las respuestas de error
 */
export const errorHandlerMiddleware = (): middy.MiddlewareObj<APIGatewayProxyEvent, APIGatewayProxyResult> => {
  return {
    onError: async (request): Promise<APIGatewayProxyResult> => {
      const { error } = request;
      console.error('Error capturado por middleware:', error);

      // Determinar el código de estado basado en el tipo de error
      let statusCode = 500;
      
      if (error instanceof Error) {
        if (error.name === 'ValidationError') {
          statusCode = 400;
        } else if (error.name === 'NotFoundError') {
          statusCode = 404;
        } else if (error.name === 'UnauthorizedError') {
          statusCode = 401;
        } else if (error.name === 'ForbiddenError') {
          statusCode = 403;
        }
      }

      // Crear la respuesta de error
      const response: APIGatewayProxyResult = {
        statusCode,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
          error: error instanceof Error ? error.name : 'Error',
          message: error instanceof Error ? error.message : 'Se produjo un error inesperado'
        })
      };

      request.response = response;
      return response;
    }
  };
};

/**
 * Clase base para errores de validación
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Clase base para errores de recurso no encontrado
 */
export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

/**
 * Clase base para errores de autenticación
 */
export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

/**
 * Clase base para errores de autorización
 */
export class ForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ForbiddenError';
  }
}