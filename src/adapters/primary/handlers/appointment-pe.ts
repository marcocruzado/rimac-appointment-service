import { SQSEvent } from 'aws-lambda';
import { EventBridge } from 'aws-sdk';
import * as mysql from 'mysql2/promise';
import { Appointment, AppointmentDTO, CountryISO, AppointmentStatus } from '../../../domain/entities/Appointment';
import { MySQLCountryAppointmentRepository } from '../../secondary/repositories/MYSQLCountryRepository';
import { AWSMessageBroker } from '../../secondary/messaging/AWSMessageBroker';
import { ProcessAppointmentUseCase } from '../../../application/usecases/ProcessAppointmentUseCase';

// Configuración de la base de datos MySQL para Perú
const dbConfig = {
  host: process.env.MYSQL_PE_HOST || 'localhost',
  user: process.env.MYSQL_PE_USER || 'user',
  password: process.env.MYSQL_PE_PASSWORD || 'password',
  database: process.env.MYSQL_PE_DATABASE || 'rimac_pe',
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
const peRepository = new MySQLCountryAppointmentRepository(pool, 'appointments_pe');
const messageBroker = new AWSMessageBroker({} as any, eventBridgeClient);

// Inicializar caso de uso
const processAppointmentUseCase = new ProcessAppointmentUseCase(peRepository, messageBroker);

/**
 * Handler para procesar citas médicas en Perú
 * @param event Evento SQS con los datos de la cita
 */
export const handler = async (event: SQSEvent): Promise<void> => {
  try {
    console.log('Procesando evento para Perú:', event);
    
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
        
        // Procesar la cita en la base de datos de Perú
        await processAppointmentUseCase.execute(appointment);
        
        console.log(`Cita procesada exitosamente en Perú: ${appointment.id}`);
      } catch (error) {
        console.error('Error al procesar registro SQS para Perú:', error);
      }
    }
  } catch (error) {
    console.error('Error general en el handler de Perú:', error);
  } finally {
    // Cerrar la conexión al finalizar
    await pool.end();
  }
};