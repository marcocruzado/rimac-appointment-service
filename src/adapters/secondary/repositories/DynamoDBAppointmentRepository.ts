import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { PutCommand, GetCommand, QueryCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { Appointment, AppointmentDTO } from '../../../domain/entities/Appointment';
import { AppointmentRepository } from '../../../domain/ports/secondary/AppointmentRepository';


export class DynamoDBAppointmentRepository implements AppointmentRepository {

  constructor(
    private readonly dynamoDBClient: DynamoDBDocumentClient,
    private readonly tableName: string
  ) {}


  async save(appointment: Appointment): Promise<Appointment> {
    const appointmentDTO = appointment.toDTO();
    
    await this.dynamoDBClient.send(new PutCommand({
      TableName: this.tableName,
      Item: appointmentDTO
    }));
    
    return appointment;
  }


  async findById(id: string): Promise<Appointment | null> {
    const result = await this.dynamoDBClient.send(new GetCommand({
      TableName: this.tableName,
      Key: { id }
    }));
    
    if (!result.Item) {
      return null;
    }
    
    return Appointment.fromDTO(result.Item as AppointmentDTO);
  }


  async findByInsuredId(insuredId: string): Promise<Appointment[]> {
    const result = await this.dynamoDBClient.send(new QueryCommand({
      TableName: this.tableName,
      IndexName: 'insuredId-index',
      KeyConditionExpression: 'insuredId = :insuredId',
      ExpressionAttributeValues: {
        ':insuredId': insuredId
      }
    }));
    
    if (!result.Items || result.Items.length === 0) {
      return [];
    }
    
    return result.Items.map(item => Appointment.fromDTO(item as AppointmentDTO));
  }


  async update(appointment: Appointment): Promise<Appointment> {
    const appointmentDTO = appointment.toDTO();
    
    await this.dynamoDBClient.send(new UpdateCommand({
      TableName: this.tableName,
      Key: { id: appointment.id },
      UpdateExpression: 'set #status = :status, updatedAt = :updatedAt',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':status': appointmentDTO.status,
        ':updatedAt': appointmentDTO.updatedAt
      }
    }));
    
    return appointment;
  }

  async create(appointment: Appointment): Promise<Appointment> {
    return this.save(appointment);
  }

  async delete(id: string): Promise<void> {
    await this.dynamoDBClient.send(new DeleteCommand({
      TableName: this.tableName,
      Key: { id }
    }));
  }

  async findByCountry(countryIso: string): Promise<Appointment[]> {
    const result = await this.dynamoDBClient.send(new QueryCommand({
      TableName: this.tableName,
      IndexName: 'countryIso-index',
      KeyConditionExpression: 'countryIso = :countryIso',
      ExpressionAttributeValues: {
        ':countryIso': countryIso
      }
    }));
    
    return (result.Items || []).map(item => Appointment.fromDTO(item as AppointmentDTO));
  }

  async findByInsuredIdAndCountry(insuredId: string, countryIso: string): Promise<Appointment[]> {
    const result = await this.dynamoDBClient.send(new QueryCommand({
      TableName: this.tableName,
      IndexName: 'insuredId-countryIso-index',
      KeyConditionExpression: 'insuredId = :insuredId AND countryIso = :countryIso',
      ExpressionAttributeValues: {
        ':insuredId': insuredId,
        ':countryIso': countryIso
      }
    }));
    
    return (result.Items || []).map(item => Appointment.fromDTO(item as AppointmentDTO));
  }

  async findAll(): Promise<Appointment[]> {
    const result = await this.dynamoDBClient.send(new QueryCommand({
      TableName: this.tableName
    }));
    
    return (result.Items || []).map(item => Appointment.fromDTO(item as AppointmentDTO));
  }
}