import { Appointment } from '../../entities/Appointment';

/**
 * Puerto secundario para la mensajería
 * Define el contrato para cualquier implementación de broker de mensajes
 */
export interface MessageBroker {
  /**
   * Publica un mensaje en el broker
   * @param eventType Tipo de evento
   * @param appointment Cita relacionada al evento
   * @param attributes Atributos adicionales del mensaje
   */
  publish(
    eventType: string,
    appointment: Appointment,
    attributes: Record<string, any>
  ): Promise<void>;

  /**
   * Envía un evento al bus de eventos
   * @param eventBusName Nombre del bus de eventos
   * @param source Fuente del evento
   * @param detailType Tipo de detalle del evento
   * @param detail Detalle del evento
   */
  sendEvent(
    eventBusName: string,
    source: string,
    detailType: string,
    detail: any
  ): Promise<void>;
}