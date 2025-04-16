import middy from '@middy/core';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

export const errorHandlerMiddleware = (): middy.MiddlewareObj<APIGatewayProxyEvent, APIGatewayProxyResult> => {
  return {
    onError: async (request): Promise<APIGatewayProxyResult> => {
      const { error } = request;
      console.error('Error capturado por middleware:', error);

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

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ForbiddenError';
  }
}