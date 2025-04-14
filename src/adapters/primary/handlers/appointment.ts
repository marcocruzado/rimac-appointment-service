import { APIGatewayProxyEvent, APIGatewayProxyResult, SQSEvent } from 'aws-lambda';
import { DynamoDB, SNS, EventBridge } from 'aws-sdk';
import middy from '@middy/core';
import jsonBodyParser from '@middy/http-json-body-parser';
import { AppointmentController } from '../controllers/AppointmentController';
import { AppointmentServiceImpl } from '../../../application/services/AppointmentServiceImpl';
import { CreateAppointmentUseCase } from '../../../application/usecases/CreateAppointmentUseCase';
import { GetAppointmentsByInsuredUseCase } from '../../../application/usecases/GetAppointmentsByInsuredUseCase';
import { ProcessAppointmentUseCase } from '../../../application/usecases/ProcessAppointmentUseCase';
import { CompleteAppointmentUseCase } from '../../../application/usecases/CompleteAppointmentUseCase';
import { DynamoDBAppointmentRepository } from '../../secondary/repositories/DynamoDBAppointmentRepository';
import { AWSMessageBroker } from '../../secondary/messaging/AWSMessageBroker';

// Inicialización de clientes de AWS
const dynamoDBClient = new DynamoDB.DocumentClient();
const snsClient = new SNS();
const eventBridgeClient = new EventBridge();

// Obtener variables de entorno
const tableName = process.env.APPOINTMENTS_TABLE || 'appointments';
const snsTopic = process.env.SNS_TOPIC_ARN || '';
const eventBusName = process.env.EVENT_BUS_NAME || '';

// Inicialización de adaptadores secundarios
const appointmentRepository = new DynamoDBAppointmentRepository(dynamoDBClient, tableName);
const messageBroker = new AWSMessageBroker(snsClient, eventBridgeClient);

// Inicialización de casos de uso
const createAppointmentUseCase = new CreateAppointmentUseCase(appointmentRepository, messageBroker);
const getAppointmentsByInsuredUseCase = new GetAppointmentsByInsuredUseCase(appointmentRepository);
// Nota: Estos casos de uso se inicializan con valores mock ya que no se utilizan directamente en este handler
const processAppointmentUseCase = new ProcessAppointmentUseCase({} as any, {} as any);
const completeAppointmentUseCase = new CompleteAppointmentUseCase(appointmentRepository);

// Inicialización del servicio y controlador
const appointmentService = new AppointmentServiceImpl(
  createAppointmentUseCase,
  getAppointmentsByInsuredUseCase,
  processAppointmentUseCase,
  completeAppointmentUseCase
);
const appointmentController = new AppointmentController(appointmentService);

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
      const detail = JSON.parse(body.detail);
      
      // Completar la cita en DynamoDB
      await appointmentService.completeAppointment(detail.id);
      
      console.log(`Cita completada exitosamente: ${detail.id}`);
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
  // Manejar solicitud de creación de cita
  if (event.httpMethod === 'POST' && event.path === '/appointments') {
    return await appointmentController.createAppointment(event.body as any);
  }
  
  // Manejar solicitud de obtención de citas por asegurado
  if (event.httpMethod === 'GET' && event.path.startsWith('/appointments/')) {
    const insuredId = event.pathParameters?.insuredId;
    
    if (!insuredId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'ID de asegurado requerido' })
      };
    }
    
    return await appointmentController.getAppointmentsByInsured(event);
  }
  
  // Ruta no encontrada
  return {
    statusCode: 404,
    body: JSON.stringify({ message: 'Ruta no encontrada' })
  };
}

// Middleware para parsear el cuerpo JSON
export const handler = middy(lambdaHandler).use(jsonBodyParser());