import { Appointment } from '../../entities/Appointment';

/**
 * Puerto secundario para el broker de mensajes
 * Define el contrato para cualquier implementación de mensajería
 */
export interface MessageBroker {
  /**
   * Publica un mensaje con los datos de la cita
   * @param topic Tema donde publicar el mensaje
   * @param appointment La cita a publicar
   * @param attributes Atributos adicionales para el mensaje
   * @returns Promesa con el resultado de la operación
   */
  publish(topic: string, appointment: Appointment, attributes?: Record<string, string>): Promise<void>;
  
  /**
   * Envía un evento al bus de eventos
   * @param eventBus Nombre del bus de eventos
   * @param source Fuente del evento
   * @param detailType Tipo de detalle del evento
   * @param appointment Datos de la cita para el evento
   * @returns Promesa con el resultado de la operación
   */
  sendEvent(
    eventBus: string, 
    source: string, 
    detailType: string, 
    appointment: Appointment
  ): Promise<void>;
}