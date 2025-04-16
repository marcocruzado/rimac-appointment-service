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


const snsClient = new SNSClient({});

let appointmentController: AppointmentController;


async function initializeServices() {
  if (!appointmentController) {
    const connections = await createMySQLConnections();
    const appointmentRepository = new MySQLAppointmentRepository(connections);
    const messageBroker = new SNSMessageBroker(snsClient);


    const createAppointmentUseCase = new CreateAppointmentUseCase(appointmentRepository, messageBroker);
    const getAppointmentsUseCase = new GetAppointmentsUseCase(appointmentRepository);
    const processAppointmentUseCase = new ProcessAppointmentUseCase(appointmentRepository, messageBroker);
    const completeAppointmentUseCase = new CompleteAppointmentUseCase(appointmentRepository, messageBroker);

 
    const appointmentService = new AppointmentServiceImpl(
      createAppointmentUseCase,
      getAppointmentsUseCase,
      processAppointmentUseCase,
      completeAppointmentUseCase
    );

    appointmentController = new AppointmentController(appointmentService);
  }
}


export const lambdaHandler = async (
  event: APIGatewayProxyEvent | SQSEvent
): Promise<APIGatewayProxyResult | void> => {
  try {
    if ('Records' in event && event.Records?.[0]?.eventSource === 'aws:sqs') {
      return handleSQSEvent(event);
    }
    
    if ('httpMethod' in event) {
      return await handleHTTPEvent(event);
    }
    
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


async function handleHTTPEvent(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    await initializeServices();

    if (event.httpMethod === 'POST' && event.path === '/appointments') {
      return await appointmentController.createAppointment(event);
    }
    
    if (event.httpMethod === 'GET' && event.path === '/appointments') {
      return await appointmentController.getAppointments(event);
    }
    
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

export const handler = middy(lambdaHandler).use(jsonBodyParser());