import { SQSEvent } from 'aws-lambda';
import * as mysql from 'mysql2/promise';
import { Appointment, CountryISO } from '../../../domain/entities/Appointment';
import { MySQLAppointmentRepository } from '../../../infrastructure/repositories/MySQLAppointmentRepository';
import { SNSMessageBroker } from '../../../infrastructure/messaging/SNSMessageBroker';
import { ProcessAppointmentUseCase } from '../../../application/usecases/ProcessAppointmentUseCase';
import { SNSClient } from '@aws-sdk/client-sns';

const dbConfig = {
  host: process.env.MYSQL_PE_HOST || 'localhost',
  user: process.env.MYSQL_PE_USER || 'user',
  password: process.env.MYSQL_PE_PASSWORD || 'password',
  database: process.env.MYSQL_PE_DATABASE || 'rimac_pe'
};

let repository: MySQLAppointmentRepository;
let processAppointmentUseCase: ProcessAppointmentUseCase;

async function initializeServices() {
  if (!repository) {
    const connection = await mysql.createConnection(dbConfig);
    const connections = { [CountryISO.PE]: connection };
    repository = new MySQLAppointmentRepository(connections);
    
    const snsClient = new SNSClient({});
    const messageBroker = new SNSMessageBroker(snsClient);
    processAppointmentUseCase = new ProcessAppointmentUseCase(repository, messageBroker);
  }
}

export const handler = async (event: SQSEvent): Promise<void> => {
  try {
    await initializeServices();

    for (const record of event.Records) {
      const body = JSON.parse(record.body);
      const appointment = Appointment.fromDTO(JSON.parse(body.Message).appointment);
      
      if (appointment.countryIso !== CountryISO.PE) {
        console.log(`Ignorando cita de país ${appointment.countryIso}`);
        continue;
      }

      await processAppointmentUseCase.execute(appointment);
      console.log(`Cita procesada exitosamente: ${appointment.id}`);
    }
  } catch (error) {
    console.error('Error al procesar eventos:', error);
    throw error;
  }
};