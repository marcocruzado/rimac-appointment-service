import { APIGatewayProxyEvent, APIGatewayProxyResult, SQSEvent } from 'aws-lambda';
import { SNSClient } from '@aws-sdk/client-sns';
import middy from '@middy/core';
import jsonBodyParser from '@middy/http-json-body-parser';
import { AppointmentController } from '../controllers/AppointmentController';
import { AppointmentServiceImpl } from '../../../application/services/AppointmentServiceImpl';
import { CreateAppointmentUseCase } from '../../../application/usecases/CreateAppointmentUseCase';
import { GetAppointmentsUseCase } from '../../../application/usecases/GetAppointmentsUseCase';
import { ProcessAppointmentUseCase } from '../../../application/usecases/ProcessAppointmentUseCase';
import { CompleteAppointmentUseCase } from '../../../application/usecases/CompleteAppointmentUseCase';
import { MySQLAppointmentRepository } from '../../../infrastructure/repositories/MySQLAppointmentRepository';
import { SNSMessageBroker } from '../../../infrastructure/messaging/SNSMessageBroker';
import { createMySQLConnections } from '../../../infrastructure/database/mysql';

// Inicialización de clientes AWS
const snsClient = new SNSClient({});

let appointmentController: AppointmentController;

// Función para inicializar los servicios
async function initializeServices() {
  if (!appointmentController) {
    // Inicialización de adaptadores secundarios
    const connections = await createMySQLConnections();
    const appointmentRepository = new MySQLAppointmentRepository(connections);
    const messageBroker = new SNSMessageBroker(snsClient);

    // Inicialización de casos de uso
    const createAppointmentUseCase = new CreateAppointmentUseCase(appointmentRepository, messageBroker);
    const getAppointmentsUseCase = new GetAppointmentsUseCase(appointmentRepository);
    const processAppointmentUseCase = new ProcessAppointmentUseCase(appointmentRepository, messageBroker);
    const completeAppointmentUseCase = new CompleteAppointmentUseCase(appointmentRepository, messageBroker);

    // Inicialización del servicio y controlador
    const appointmentService = new AppointmentServiceImpl(
      createAppointmentUseCase,
      getAppointmentsUseCase,
      processAppointmentUseCase,
      completeAppointmentUseCase
    );

    appointmentController = new AppointmentController(appointmentService);
  }
}

/**
 * Manejador para las solicitudes HTTP y eventos SQS
 * @param event Evento de API Gateway o SQS
 * @returns Respuesta HTTP o void para eventos SQS
 */
export const lambdaHandler = async (
  event: APIGatewayProxyEvent | SQSEvent
): Promise<APIGatewayProxyResult | void> => {
  try {
    // Manejar eventos SQS (confirmación de citas)
    if ('Records' in event && event.Records?.[0]?.eventSource === 'aws:sqs') {
      return handleSQSEvent(event);
    }
    
    // Manejar solicitudes HTTP
    if ('httpMethod' in event) {
      return await handleHTTPEvent(event);
    }
    
    // Tipo de evento no manejado
    console.error('Tipo de evento no manejado:', event);
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Tipo de evento no válido' })
    };
  } catch (error) {
    console.error('Error en el handler:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error interno del servidor' })
    };
  }
};

/**
 * Maneja eventos SQS de confirmación
 * @param event Evento SQS
 */
async function handleSQSEvent(event: SQSEvent): Promise<void> {
  for (const record of event.Records) {
    try {
      const body = JSON.parse(record.body);
      const detail = JSON.parse(body.Message);
      
      await appointmentController.processConfirmation(detail.appointment.id);
      
      console.log(`Cita completada exitosamente: ${detail.appointment.id}`);
    } catch (error) {
      console.error('Error al procesar evento SQS:', error);
    }
  }
}

/**
 * Maneja solicitudes HTTP
 * @param event Evento de API Gateway
 * @returns Respuesta HTTP
 */
async function handleHTTPEvent(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    await initializeServices();

    // Manejar solicitud de creación de cita
    if (event.httpMethod === 'POST' && event.path === '/appointments') {
      return await appointmentController.createAppointment(event);
    }
    
    // Manejar solicitud de obtención de citas
    if (event.httpMethod === 'GET' && event.path === '/appointments') {
      return await appointmentController.getAppointments(event);
    }
    
    // Ruta no encontrada
    return {
      statusCode: 404,
      body: JSON.stringify({ message: 'Ruta no encontrada' })
    };
  } catch (error) {
    console.error('Error en el handler:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Error desconocido'
      })
    };
  }
}

// Middleware para parsear el cuerpo JSON
export const handler = middy(lambdaHandler).use(jsonBodyParser());