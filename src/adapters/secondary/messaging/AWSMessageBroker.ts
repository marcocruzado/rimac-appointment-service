import { SNS, EventBridge } from 'aws-sdk';
import { Appointment } from '../../../domain/entities/Appointment';
import { MessageBroker } from '../../../domain/ports/secondary/MessageBroker';

/**
 * Implementación del broker de mensajes usando AWS
 * Adaptador secundario que implementa las operaciones de mensajería
 */
export class AWSMessageBroker implements MessageBroker {
  /**
   * Constructor del broker
   * @param snsClient Cliente de SNS
   * @param eventBridgeClient Cliente de EventBridge
   */
  constructor(
    private readonly snsClient: SNS,
    private readonly eventBridgeClient: EventBridge
  ) {}

  /**
   * Publica un mensaje con los datos de la cita en SNS
   * @param topicArn ARN del tema SNS
   * @param appointment La cita a publicar
   * @param attributes Atributos adicionales para el mensaje
   * @returns Promesa con el resultado de la operación
   */
  async publish(topicArn: string, appointment: Appointment, attributes?: Record<string, string>): Promise<void> {
    const messageAttributes: SNS.MessageAttributeMap = {};
    
    if (attributes) {
      Object.entries(attributes).forEach(([key, value]) => {
        messageAttributes[key] = {
          DataType: 'String',
          StringValue: value
        };
      });
    }
    
    await this.snsClient.publish({
      TopicArn: topicArn,
      Message: JSON.stringify(appointment),
      MessageAttributes: messageAttributes
    }).promise();
  }

  /**
   * Envía un evento al bus de eventos de EventBridge
   * @param eventBusName Nombre del bus de eventos
   * @param source Fuente del evento
   * @param detailType Tipo de detalle del evento
   * @param appointment Datos de la cita para el evento
   * @returns Promesa con el resultado de la operación
   */
  async sendEvent(
    eventBusName: string, 
    source: string, 
    detailType: string, 
    appointment: Appointment
  ): Promise<void> {
    await this.eventBridgeClient.putEvents({
      Entries: [
        {
          EventBusName: eventBusName,
          Source: source,
          DetailType: detailType,
          Detail: JSON.stringify(appointment)
        }
      ]
    }).promise();
  }
}