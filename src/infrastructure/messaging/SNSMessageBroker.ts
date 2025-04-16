import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';
import { MessageBroker } from '../../domain/ports/secondary/MessageBroker';
import { Appointment } from '../../domain/entities/Appointment';

export class SNSMessageBroker implements MessageBroker {
  private sns: SNSClient;
  private eventBridge: EventBridgeClient;

  constructor(private readonly topicArn: string) {
    this.sns = new SNSClient({ region: 'us-east-1' });
    this.eventBridge = new EventBridgeClient({ region: 'us-east-1' });
  }

  async publish(event: string, data: any, attributes?: Record<string, string>): Promise<void> {
    const params = {
      TopicArn: this.topicArn,
      Message: JSON.stringify({
        event,
        data,
        timestamp: new Date().toISOString()
      }),
      MessageAttributes: attributes ? 
        Object.entries(attributes).reduce((acc, [key, value]) => ({
          ...acc,
          [key]: {
            DataType: 'String',
            StringValue: value
          }
        }), {}) : undefined
    };

    await this.sns.send(new PublishCommand(params));
  }

  async sendEvent(
    eventBus: string,
    source: string,
    detailType: string,
    appointment: Appointment
  ): Promise<void> {
    await this.eventBridge.send(new PutEventsCommand({
      Entries: [
        {
          EventBusName: eventBus,
          Source: source,
          DetailType: detailType,
          Detail: JSON.stringify(appointment)
        }
      ]
    }));
  }
} 