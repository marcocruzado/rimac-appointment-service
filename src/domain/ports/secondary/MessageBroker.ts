import { Appointment } from '../../entities/Appointment';


export interface MessageBroker {
  publish(
    eventType: string,
    appointment: Appointment,
    attributes: Record<string, any>
  ): Promise<void>;

  sendEvent(
    eventBusName: string,
    source: string,
    detailType: string,
    detail: any
  ): Promise<void>;
}