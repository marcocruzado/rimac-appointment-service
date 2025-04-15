import { SNS, EventBridge } from 'aws-sdk';
import { MessageBroker } from '../../domain/ports/secondary/MessageBroker';
import { Appointment } from '../../domain/entities/Appointment';

export class SNSMessageBroker implements MessageBroker {
  private sns: SNS;
  private eventBridge: EventBridge;

  constructor(private readonly topicArn: string) {
    this.sns = new SNS();
    this.eventBridge = new EventBridge();
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

    await this.sns.publish(params).promise();
  }

  async sendEvent(
    eventBus: string,
    source: string,
    detailType: string,
    appointment: Appointment
  ): Promise<void> {
    await this.eventBridge.putEvents({
      Entries: [
        {
          EventBusName: eventBus,
          Source: source,
          DetailType: detailType,
          Detail: JSON.stringify(appointment)
        }
      ]
    }).promise();
  }
} 