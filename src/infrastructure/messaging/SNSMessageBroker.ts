import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { MessageBroker } from '../../domain/ports/secondary/MessageBroker';
import { Appointment } from '../../domain/entities/Appointment';

export class SNSMessageBroker implements MessageBroker {
  constructor(private readonly snsClient: SNSClient) {}

  async publish(
    eventType: string,
    appointment: Appointment,
    attributes: Record<string, any>
  ): Promise<void> {
    try {
      const message = {
        eventType,
        appointment: appointment.toDTO(),
        attributes,
        timestamp: new Date().toISOString()
      };

      const command = new PublishCommand({
        TopicArn: process.env.SNS_TOPIC_ARN,
        Message: JSON.stringify(message),
        MessageAttributes: {
          eventType: {
            DataType: 'String',
            StringValue: eventType
          },
          countryIso: {
            DataType: 'String',
            StringValue: appointment.countryIso
          }
        }
      });

      await this.snsClient.send(command);
    } catch (error) {
      console.error('Error al publicar mensaje en SNS:', error);
      throw error;
    }
  }

  async sendEvent(
    eventBusName: string,
    source: string,
    detailType: string,
    detail: any
  ): Promise<void> {
      throw new Error('Método no implementado para SNS');
  }
} 