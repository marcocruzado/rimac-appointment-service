# Rimac Appointment Service

Servicio para la gestión de citas médicas que permite crear, consultar, actualizar y eliminar citas.

## Requisitos

- Node.js >= 14
- AWS CLI configurado
- MySQL (para Perú y Chile)

## Variables de Entorno

```bash
# Base de datos Perú
MYSQL_HOST_PE=
MYSQL_USER_PE=
MYSQL_PASSWORD_PE=
MYSQL_DATABASE_PE=

# Base de datos Chile
MYSQL_HOST_CL=
MYSQL_USER_CL=
MYSQL_PASSWORD_CL=
MYSQL_DATABASE_CL=

# AWS SNS
SNS_TOPIC_ARN=
```

## Instalación

```bash
npm install
```

## Desarrollo Local

```bash
npm run dev
```

## Despliegue

```bash
npm run deploy
```

## Endpoints

### Crear Cita
- POST /appointments
- Body: CreateAppointmentDto

### Obtener Cita
- GET /appointments/{appointmentId}/country/{country}

### Actualizar Cita
- PUT /appointments/{appointmentId}/country/{country}
- Body: UpdateAppointmentParams

### Eliminar Cita
- DELETE /appointments/{appointmentId}/country/{country}

## Documentación API
La documentación detallada de la API está disponible en `/swagger` cuando el servicio está en ejecución. 