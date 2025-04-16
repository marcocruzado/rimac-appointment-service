export class AppointmentError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppointmentError';
  }
}

export class ValidationError extends AppointmentError {
  constructor(message: string, public readonly errors: string[] = []) {
    super('VALIDATION_ERROR', message, 400);
    this.name = 'ValidationError';
  }
}

export class DuplicateAppointmentError extends AppointmentError {
  constructor(insuredId: string) {
    super(
      'DUPLICATE_APPOINTMENT',
      `El asegurado ${insuredId} ya tiene una cita pendiente`,
      409
    );
    this.name = 'DuplicateAppointmentError';
  }
}

export class AppointmentNotFoundError extends AppointmentError {
  constructor(id: string) {
    super(
      'APPOINTMENT_NOT_FOUND',
      `No se encontró la cita con id ${id}`,
      404
    );
    this.name = 'AppointmentNotFoundError';
  }
}

export class DatabaseError extends AppointmentError {
  constructor(message: string) {
    super('DATABASE_ERROR', message, 500);
    this.name = 'DatabaseError';
  }
}

export class MessagingError extends AppointmentError {
  constructor(message: string) {
    super('MESSAGING_ERROR', message, 500);
    this.name = 'MessagingError';
  }
} 