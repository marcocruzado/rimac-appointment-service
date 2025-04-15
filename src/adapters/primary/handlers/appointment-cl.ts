import { SQSEvent } from 'aws-lambda';
import { EventBridge } from 'aws-sdk';
import * as mysql from 'mysql2/promise';
import { Appointment, AppointmentDTO, CountryISO, AppointmentStatus } from '../../../domain/entities/Appointment';
import { AWSMessageBroker } from '../../secondary/messaging/AWSMessageBroker';
import { ProcessAppointmentUseCase } from '../../../application/usecases/ProcessAppointmentUseCase';
import { MySQLCountryAppointmentRepository } from '../../secondary/repositories/MYSQLCountryRepository';

// Configuración de la base de datos MySQL para Chile
const dbConfig = {
  host: process.env.MYSQL_CL_HOST || 'localhost',
  user: process.env.MYSQL_CL_USER || 'user',
  password: process.env.MYSQL_CL_PASSWORD || 'password',
  database: process.env.MYSQL_CL_DATABASE || 'rimac_cl',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Cliente de EventBridge
const eventBridgeClient = new EventBridge();
const eventBusName = process.env.EVENT_BUS_NAME || '';

// Crear pool de conexiones MySQL
const pool = mysql.createPool(dbConfig);

// Inicializar adaptadores
  const clRepository = new MySQLCountryAppointmentRepository(pool, 'appointments_cl');
const messageBroker = new AWSMessageBroker({} as any, eventBridgeClient);

// Inicializar caso de uso
const processAppointmentUseCase = new ProcessAppointmentUseCase(clRepository, messageBroker);

/**
 * Handler para procesar citas médicas en Chile
 * @param event Evento SQS con los datos de la cita
 */
export const handler = async (event: SQSEvent): Promise<void> => {
  try {
    console.log('Procesando evento para Chile:', event);
    
    for (const record of event.Records) {
      try {
        // Parsear el mensaje de SNS
        const snsMessage = JSON.parse(record.body);
        console.log('Mensaje SNS:', snsMessage);
        
        // Obtener los datos de la cita
        const appointmentData = JSON.parse(snsMessage.Message) as AppointmentDTO;
        console.log('Datos de la cita:', appointmentData);
        
        // Convertir a entidad de dominio
        const appointment = new Appointment(appointmentData.id, appointmentData.insuredId, appointmentData.scheduleId.toString()  , appointmentData.countryISO as CountryISO, appointmentData.status as AppointmentStatus, new Date(appointmentData.createdAt), new Date(appointmentData.updatedAt)); 
        
        // Procesar la cita en la base de datos de Chile
        await processAppointmentUseCase.execute(appointment);
        
        console.log(`Cita procesada exitosamente en Chile: ${appointment.id}`);
      } catch (error) {
        console.error('Error al procesar registro SQS para Chile:', error);
      }
    }
  } catch (error) {
    console.error('Error general en el handler de Chile:', error);
  } finally {
    // Cerrar la conexión al finalizar
    await pool.end();
  }
};