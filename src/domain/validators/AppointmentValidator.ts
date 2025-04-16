import { CreateAppointmentDto } from '../entities/Appointment';

export class AppointmentValidator {
  static validateCreateAppointment(data: CreateAppointmentDto): string[] {
    const errors: string[] = [];

    // Validar insuredId (5 dígitos)
    if (!data.insuredId || !/^\d{5}$/.test(data.insuredId)) {
      errors.push('El insuredId debe tener exactamente 5 dígitos');
    }

    // Validar scheduleId
    if (!data.scheduleId || typeof data.scheduleId !== 'number' || data.scheduleId <= 0) {
      errors.push('El scheduleId debe ser un número positivo');
    }

    // Validar countryISO
    if (!data.countryIso || !['PE', 'CL'].includes(data.countryIso)) {
      errors.push('El countryISO solo puede ser PE o CL');
    }

    // Validar datos del espacio (si están presentes)
    if (data.schedule) {
      if (!data.schedule.centerId || typeof data.schedule.centerId !== 'number') {
        errors.push('El centerId debe ser un número válido');
      }

      if (!data.schedule.specialtyId || typeof data.schedule.specialtyId !== 'number') {
        errors.push('El specialtyId debe ser un número válido');
      }

      if (!data.schedule.medicId || typeof data.schedule.medicId !== 'number') {
        errors.push('El medicId debe ser un número válido');
      }

      if (!data.schedule.date || !this.isValidDate(data.schedule.date)) {
        errors.push('La fecha debe ser una fecha válida en formato ISO');
      }
    }

    return errors;
  }

  private static isValidDate(date: string): boolean {
    const dateObj = new Date(date);
    return dateObj instanceof Date && !isNaN(dateObj.getTime());
  }
} 