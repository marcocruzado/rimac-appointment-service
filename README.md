# Servicio de Citas Médicas RIMAC

Servicio serverless para la gestión de citas médicas en Perú y Chile.

## Arquitectura

El servicio está construido siguiendo los principios de Arquitectura Hexagonal (Ports & Adapters) y utiliza los siguientes servicios de AWS:

- API Gateway: Para exponer los endpoints HTTP
- Lambda: Para la ejecución del código serverless
- DynamoDB: Como base de datos principal
- RDS (MySQL): Como base de datos específica por país
- SNS: Para la publicación de eventos
- SQS: Para el procesamiento asíncrono
- EventBridge: Para la orquestación de eventos

## Requisitos

- Node.js 18.x
- AWS CLI configurado
- Serverless Framework
- MySQL (para desarrollo local)

## Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
```bash
cp .env.example .env
# Editar .env con tus valores
```

3. Crear las tablas MySQL:
```bash
mysql -u root -p < migrations/create_tables.sql
```

## Despliegue

Para desplegar en AWS:

```bash
# Despliegue en desarrollo
serverless deploy --stage dev

# Despliegue en producción
serverless deploy --stage prod
```

## API Endpoints

### POST /appointments
Crea una nueva cita médica.

Request:
```json
{
  "insuredId": "string",
  "scheduleId": "string",
  "countryISO": "PE|CL"
}
```

### GET /appointments/{insuredId}
Obtiene las citas de un asegurado.

## Desarrollo

Para ejecutar localmente:

```bash
serverless offline
```

## Tests

```bash
# Ejecutar tests unitarios
npm run test

# Ejecutar tests de integración
npm run test:integration
```

## Estructura del Proyecto

```
src/
  ├── adapters/           # Adaptadores (primarios y secundarios)
  ├── application/        # Casos de uso y servicios
  ├── domain/            # Entidades y puertos
  ├── infrastructure/    # Configuración de infraestructura
  └── shared/            # Utilidades compartidas
```

## Contribución

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add some amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## Licencia

Este proyecto es privado y propiedad de RIMAC Seguros. 