import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { PutCommand, GetCommand, QueryCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { Appointment, AppointmentDTO, CreateAppointmentDto, AppointmentStatus, CountryISO } from '../../../domain/entities/Appointment';
import { AppointmentRepository } from '../../../domain/ports/secondary/AppointmentRepository';

/**
 * Implementación del repositorio de citas en DynamoDB
 * Adaptador secundario que implementa las operaciones de persistencia
 */
export class DynamoDBAppointmentRepository implements AppointmentRepository {
  /**
   * Constructor del repositorio
   * @param dynamoDBClient Cliente de DynamoDB
   * @param tableName Nombre de la tabla en DynamoDB
   */
  constructor(
    private readonly dynamoDBClient: DynamoDBDocumentClient,
    private readonly tableName: string
  ) {}

  /**
   * Guarda una cita en DynamoDB
   * @param appointment La cita a guardar
   * @returns Promesa con la cita guardada
   */
  async save(appointment: Appointment): Promise<Appointment> {
    const now = new Date();
    appointment.updatedAt = now;
    
    await this.dynamoDBClient.send(new PutCommand({
      TableName: this.tableName,
      Item: {
        id: appointment.id,
        insuredId: appointment.insuredId,
        scheduleId: appointment.scheduleId,
        countryIso: appointment.countryIso,
        status: appointment.status,
        createdAt: appointment.createdAt.toISOString(),
        updatedAt: appointment.updatedAt.toISOString()
      }
    }));
    
    return appointment;
  }

  /**
   * Busca una cita por su ID en DynamoDB
   * @param id ID de la cita
   * @returns Promesa con la cita encontrada o null
   */
  async findById(id: string): Promise<Appointment | null> {
    const result = await this.dynamoDBClient.send(new GetCommand({
      TableName: this.tableName,
      Key: { id }
    }));
    
    if (!result.Item) {
      return null;
    }
    
    return new Appointment(
      result.Item.id,
      result.Item.insuredId,
      result.Item.scheduleId,
      result.Item.countryIso as CountryISO,
      result.Item.status as AppointmentStatus,
      new Date(result.Item.createdAt),
      new Date(result.Item.updatedAt)
    );
  }

  /**
   * Busca todas las citas de un asegurado en DynamoDB
   * @param insuredId ID del asegurado
   * @returns Promesa con la lista de citas
   */
  async findByInsuredId(insuredId: string): Promise<Appointment[]> {
    const result = await this.dynamoDBClient.send(new QueryCommand({
      TableName: this.tableName,
      IndexName: 'insuredId-index',
      KeyConditionExpression: 'insuredId = :insuredId',
      ExpressionAttributeValues: {
        ':insuredId': insuredId
      }
    }));
    
    return (result.Items || []).map(item => new Appointment(
      item.id,
      item.insuredId,
      item.scheduleId,
      item.countryIso as CountryISO,
      item.status as AppointmentStatus,
      new Date(item.createdAt),
      new Date(item.updatedAt)
    ));
  }

  /**
   * Actualiza el estado de una cita en DynamoDB
   * @param appointment La cita con el estado actualizado
   * @returns Promesa con la cita actualizada
   */
  async update(appointment: Appointment): Promise<Appointment> {
    appointment.updatedAt = new Date();
    
    await this.dynamoDBClient.send(new UpdateCommand({
      TableName: this.tableName,
      Key: { id: appointment.id },
      UpdateExpression: 'set #status = :status, updatedAt = :updatedAt',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':status': appointment.status,
        ':updatedAt': appointment.updatedAt.toISOString()
      }
    }));
    
    return appointment;
  }

  async create(data: CreateAppointmentDto): Promise<Appointment> {
    const now = new Date();
    const appointment = new Appointment(
      uuidv4(),
      data.insuredId,
      data.scheduleId.toString(),
      data.countryIso as CountryISO,
      AppointmentStatus.PENDING,
      now,
      now
    );

    return this.save(appointment);
  }

  async delete(id: string): Promise<void> {
    await this.dynamoDBClient.send(new DeleteCommand({
      TableName: this.tableName,
      Key: { id }
    }));
  }
}