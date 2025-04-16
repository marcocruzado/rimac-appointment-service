import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';
import { Appointment } from '../../../domain/entities/Appointment';
import { MessageBroker } from '../../../domain/ports/secondary/MessageBroker';
export class AWSMessageBroker implements MessageBroker {

  constructor(
    private readonly snsClient: SNSClient,
    private readonly eventBridgeClient: EventBridgeClient
  ) {}

  async publish(topicArn: string, appointment: Appointment, attributes?: Record<string, string>): Promise<void> {
    const messageAttributes: Record<string, { DataType: string; StringValue: string }> = {};
    
    if (attributes) {
      Object.entries(attributes).forEach(([key, value]) => {
        messageAttributes[key] = {
          DataType: 'String',
          StringValue: value
        };
      });
    }
    
    await this.snsClient.send(new PublishCommand({
      TopicArn: topicArn,
      Message: JSON.stringify(appointment),
      MessageAttributes: messageAttributes
    }));
  }

  async sendEvent(
    eventBusName: string, 
    source: string, 
    detailType: string, 
    appointment: Appointment
  ): Promise<void> {
    await this.eventBridgeClient.send(new PutEventsCommand({
      Entries: [
        {
          EventBusName: eventBusName,
          Source: source,
          DetailType: detailType,
          Detail: JSON.stringify(appointment)
        }
      ]
    }));
  }
}