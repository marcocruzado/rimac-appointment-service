import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { PutCommand, GetCommand, QueryCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { Appointment, AppointmentDTO } from '../../../domain/entities/Appointment';
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
    const appointmentDTO = appointment.toDTO();
    
    await this.dynamoDBClient.send(new PutCommand({
      TableName: this.tableName,
      Item: appointmentDTO
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
    
    return Appointment.fromDTO(result.Item as AppointmentDTO);
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
    
    if (!result.Items || result.Items.length === 0) {
      return [];
    }
    
    return result.Items.map(item => Appointment.fromDTO(item as AppointmentDTO));
  }

  /**
   * Actualiza el estado de una cita en DynamoDB
   * @param appointment La cita con el estado actualizado
   * @returns Promesa con la cita actualizada
   */
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
}