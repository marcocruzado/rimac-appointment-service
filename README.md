# Servicio de Citas Médicas RIMAC

Servicio serverless para la gestión de citas médicas en Perú y Chile utilizando AWS.

## Arquitectura

El servicio está construido siguiendo los principios de Arquitectura Hexagonal (Ports & Adapters) y utiliza:

- API Gateway: Endpoints HTTP
- Lambda: Ejecución serverless
- DynamoDB: Base de datos principal
- RDS (MySQL): Base de datos por país
- SNS: Publicación de eventos
- SQS: Procesamiento asíncrono
- EventBridge: Orquestación de eventos

## Prerrequisitos

- Node.js 18.x
- AWS CLI instalado y configurado
- Serverless Framework
- MySQL (desarrollo local)
- Cuenta AWS con permisos para:
  - Lambda
  - API Gateway
  - DynamoDB
  - RDS
  - SNS
  - SQS
  - EventBridge
  - IAM

## Configuración AWS

1. Crear un usuario IAM con permisos:
   ```bash
   # Permisos necesarios
   - AWSLambdaFullAccess
   - AmazonAPIGatewayAdministrator
   - AmazonDynamoDBFullAccess
   - AmazonRDSFullAccess
   - AmazonSNSFullAccess
   - AmazonSQSFullAccess
   - AmazonEventBridgeFullAccess
   - IAMFullAccess
   ```

2. Configurar credenciales AWS:
   ```bash
   aws configure
   # Ingresar Access Key ID
   # Ingresar Secret Access Key
   # Region: us-east-1
   # Output format: json
   ```

3. Crear bases de datos RDS:
   - Crear instancia RDS MySQL para Perú
   - Crear instancia RDS MySQL para Chile
   - Guardar los endpoints y credenciales

## Instalación Local

1. Clonar el repositorio:
   ```bash
   git clone <repositorio>
   cd rimac-appointment-service
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Configurar variables de entorno:
   ```bash
   cp .env.example .env
   ```

4. Editar `.env` con los valores correctos:
   ```
   # MySQL Perú
   MYSQL_HOST_PE=<endpoint-rds-peru>
   MYSQL_USER_PE=admin
   MYSQL_PASSWORD_PE=<password>
   MYSQL_DATABASE_PE=rimac_appointments_pe
   MYSQL_PORT_PE=3306

   # MySQL Chile
   MYSQL_HOST_CL=<endpoint-rds-chile>
   MYSQL_USER_CL=admin
   MYSQL_PASSWORD_CL=<password>
   MYSQL_DATABASE_CL=rimac_appointments_cl
   MYSQL_PORT_CL=3306

   # AWS
   STAGE=dev
   REGION=us-east-1
   ```

5. Ejecutar migraciones:
   ```bash
   npm run migrate:mysql
   ```

## Despliegue

1. Despliegue en desarrollo:
   ```bash
   npm run deploy:dev
   ```

2. Despliegue en producción:
   ```bash
   npm run deploy:prod
   ```

## Pruebas Locales

1. Iniciar servidor local:
   ```bash
   npm run dev
   ```

2. Probar endpoints:

   Crear cita:
   ```bash
   curl -X POST http://localhost:3000/dev/appointments \
   -H "Content-Type: application/json" \
   -d '{
     "insuredId": "12345",
     "scheduleId": "SCH001",
     "countryISO": "PE"
   }'
   ```

   Obtener citas:
   ```bash
   curl http://localhost:3000/dev/appointments/12345
   ```

## Estructura del Proyecto

```
src/
  ├── adapters/           # Adaptadores primarios y secundarios
  │   ├── primary/       # Controladores y handlers
  │   └── secondary/     # Repositorios y mensajería
  ├── application/       # Casos de uso
  ├── domain/           # Entidades y puertos
  ├── infrastructure/   # Configuración
  └── shared/           # Utilidades
```

## Monitoreo y Logs

- CloudWatch Logs: `/aws/lambda/rimac-appointment-service-{stage}-{function}`
- CloudWatch Metrics: Métricas de Lambda, API Gateway y DynamoDB
- X-Ray: Trazabilidad de requests (si está habilitado)

## Solución de Problemas

1. Error de conexión a RDS:
   - Verificar security groups
   - Validar credenciales en .env
   - Comprobar que la instancia esté activa

2. Error de permisos AWS:
   - Verificar rol IAM de Lambda
   - Validar políticas en serverless.yml
   - Comprobar credenciales AWS CLI

3. Error en despliegue:
   - Ejecutar `serverless print`
   - Verificar logs de CloudFormation
   - Validar sintaxis de serverless.yml

## Mantenimiento

1. Actualizar dependencias:
   ```bash
   npm update
   ```

2. Ejecutar tests:
   ```bash
   npm test
   ```

3. Verificar calidad de código:
   ```bash
   npm run lint
   ```

## Seguridad

- Todas las credenciales deben estar en AWS Secrets Manager
- Usar variables de entorno para configuración
- Mantener actualizadas las dependencias
- Seguir las mejores prácticas de AWS Well-Architected Framework

## Soporte

Para soporte contactar a:
- Email: dev@rimac.com
- Slack: #team-appointments

## Licencia

Este proyecto es privado y propiedad de RIMAC Seguros.

## Desarrollo Local con Docker

Si no tienes acceso a las bases de datos RDS en AWS, puedes usar Docker para desarrollo local:

1. Prerrequisitos:
   - Docker
   - Docker Compose

2. Iniciar bases de datos:
   ```bash
   docker-compose up -d
   ```

3. Verificar que los contenedores estén corriendo:
   ```bash
   docker-compose ps
   ```

4. Usar configuración local:
   ```bash
   cp .env.local .env
   ```

5. Ejecutar migraciones:
   ```bash
   npm run migrate:mysql
   ```

6. Iniciar la aplicación:
   ```bash
   npm run dev
   ```

7. Probar la conexión:
   ```bash
   # Base de datos Perú (Puerto 3306)
   mysql -h localhost -P 3306 -u admin -padmin123 rimac_appointments_pe

   # Base de datos Chile (Puerto 3307)
   mysql -h localhost -P 3307 -u admin -padmin123 rimac_appointments_cl
   ```

8. Detener los contenedores:
   ```bash
   docker-compose down
   ```

9. Eliminar volúmenes (si necesitas empezar desde cero):
   ```bash
   docker-compose down -v
   ```

## Documentación API

La documentación OpenAPI (Swagger) se encuentra en `src/infrastructure/config/swagger.yml`. Para visualizarla:

1. **Swagger UI**: Copie el contenido del archivo en [Swagger Editor](https://editor.swagger.io/)
2. **API Gateway**: Importe el archivo en la consola de API Gateway
3. **Local**: Use herramientas como `swagger-ui-express` si desea servir la documentación localmente

La documentación incluye:
- Todos los endpoints disponibles
- Esquemas de request/response
- Ejemplos de payload
- Códigos de respuesta
- Autenticación requerida 