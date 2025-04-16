# Servicio de Citas Médicas RIMAC

Servicio serverless para la gestión de citas médicas en Perú y Chile utilizando AWS.

## Versiones y Requisitos

- Node.js: v18.x o superior
- AWS CLI: v2.x
- Serverless Framework: v3.x
- MySQL: v8.x

## Tecnologías Utilizadas

- **AWS Services**:
  - Lambda (Node.js 18.x)
  - API Gateway
  - SNS (Simple Notification Service)
  - SQS (Simple Queue Service)
  - RDS MySQL (Base de datos por país)
  - EventBridge
  - CloudWatch (Logs y métricas)

- **Frameworks y Librerías**:
  - TypeScript 5.x
  - mysql2 (MySQL client)
  - @aws-sdk/client-sns
  - @aws-sdk/client-sqs
  - @middy/core (Middleware)
  - uuid

## Arquitectura

### Diagrama de Arquitectura
```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│ API Gateway │────▶│    Lambda    │────▶│ RDS MySQL   │
└─────────────┘     └──────────────┘     └─────────────┘
                          │
                          ▼
                    ┌──────────────┐
                    │     SNS      │
                    └──────────────┘
                          │
                          ▼
                    ┌──────────────┐
                    │     SQS      │
                    └──────────────┘
```

### Arquitectura Hexagonal (Ports & Adapters)
```
src/
├── adapters/           # Adaptadores primarios y secundarios
│   ├── primary/       # Controladores y handlers
│   └── secondary/     # Implementaciones de repositorios
├── application/       # Casos de uso y servicios
├── domain/           # Entidades y puertos
└── infrastructure/   # Configuración y utilidades
```

## Instalación y Configuración

1. **Clonar el repositorio**:
   ```bash
   git clone <repositorio>
   cd rimac-appointment-service
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**:
   ```bash
   cp .env.example .env
   ```
   Editar `.env` con los valores correspondientes:
   ```env
   # MySQL Perú
   MYSQL_HOST_PE=<host>
   MYSQL_USER_PE=admin
   MYSQL_PASSWORD_PE=<password>
   MYSQL_DATABASE_PE=rimac_appointments_pe
   MYSQL_PORT_PE=3306

   # MySQL Chile
   MYSQL_HOST_CL=<host>
   MYSQL_USER_CL=admin
   MYSQL_PASSWORD_CL=<password>
   MYSQL_DATABASE_CL=rimac_appointments_cl
   MYSQL_PORT_CL=3306

   # AWS
   SNS_TOPIC_ARN=<arn>
   AWS_REGION=us-east-1
   ```

## Endpoints

### 1. Crear Cita
- **Método**: POST
- **Ruta**: `/appointments`
- **Body**:
  ```json
  {
    "insuredId": "12345",
    "scheduleId": "SCH001",
    "countryIso": "PE"  // PE o CL
  }
  ```
- **Respuesta Exitosa** (201):
  ```json
  {
    "message": "Agendamiento en proceso",
    "appointment": {
      "id": "uuid",
      "insuredId": "12345",
      "scheduleId": "SCH001",
      "countryIso": "PE",
      "status": "PENDING",
      "createdAt": "2024-03-20T10:00:00Z",
      "updatedAt": "2024-03-20T10:00:00Z"
    }
  }
  ```

### 2. Obtener Citas
- **Método**: GET
- **Ruta**: `/appointments`
- **Query Parameters**:
  - `insuredId` (opcional): ID del asegurado
  - `countryIso` (opcional): País (PE o CL)
- **Respuesta Exitosa** (200):
  ```json
  {
    "filters": {
      "insuredId": "12345",
      "countryIso": "PE"
    },
    "appointments": [
      {
        "id": "uuid",
        "insuredId": "12345",
        "scheduleId": "SCH001",
        "countryIso": "PE",
        "status": "PENDING",
        "createdAt": "2024-03-20T10:00:00Z",
        "updatedAt": "2024-03-20T10:00:00Z"
      }
    ]
  }
  ```

## Flujo de Trabajo

1. **Creación de Cita**:
   - Cliente envía solicitud POST a `/appointments`
   - Sistema valida datos y disponibilidad
   - Crea registro en MySQL del país correspondiente
   - Publica evento en SNS
   - Retorna confirmación al cliente

2. **Procesamiento Asíncrono**:
   - SNS publica mensaje a SQS
   - Lambda procesa mensaje de SQS
   - Actualiza estado de la cita
   - Envía notificaciones si es necesario

3. **Consulta de Citas**:
   - Cliente solicita citas vía GET `/appointments`
   - Sistema consulta bases de datos según filtros
   - Retorna lista de citas encontradas

## Despliegue

### Desarrollo
```bash
npm run deploy:dev
```

### Producción
```bash
npm run deploy:prod
```

## Pruebas

### Ejecutar Tests
```bash
# Tests unitarios
npm run test

# Tests de integración
npm run test:integration

# Cobertura
npm run test:coverage
```

### Pruebas Locales
```bash
# Iniciar servidor local
npm run dev

# Crear cita
curl -X POST http://localhost:3000/dev/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "insuredId": "12345",
    "scheduleId": "SCH001",
    "countryIso": "PE"
  }'

# Obtener citas
curl "http://localhost:3000/dev/appointments?insuredId=12345&countryIso=PE"
```

## Monitoreo

- **Logs**: CloudWatch Logs
  - Grupo: `/aws/lambda/rimac-appointment-service-{stage}-{function}`
  - Retención: 30 días

- **Métricas**: CloudWatch Metrics
  - Latencia
  - Errores
  - Invocaciones
  - Concurrencia

## Mantenimiento

### Actualizar Dependencias
```bash
npm update
```

### Verificar Código
```bash
# Lint
npm run lint

# Fix automático
npm run lint:fix

# Tipos
npm run type-check
```

## Desarrollo Local con Docker

### Prerrequisitos
- Docker v24.x o superior
- Docker Compose v2.x

### Configuración

1. **Iniciar servicios**:
   ```bash
   docker-compose up -d
   ```

2. **Verificar contenedores**:
   ```bash
   docker-compose ps
   ```

3. **Configuración local**:
   ```bash
   cp .env.local .env
   ```

4. **Estructura de la base de datos**:
   ```bash
   npm run migrate:mysql
   ```

### Bases de datos

- **Perú**: 
  - Puerto: 3306
  - Credenciales: admin/admin123
  - Base de datos: rimac_appointments_pe

- **Chile**:
  - Puerto: 3307
  - Credenciales: admin/admin123
  - Base de datos: rimac_appointments_cl

### Comandos útiles

```bash
# Conectar a MySQL Perú
mysql -h localhost -P 3306 -u admin -padmin123 rimac_appointments_pe

# Conectar a MySQL Chile
mysql -h localhost -P 3307 -u admin -padmin123 rimac_appointments_cl

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down

# Limpiar volúmenes
docker-compose down -v
```

## Licencia

Este proyecto es una prueba tecnica para RIMAC Seguros.

## Documentación API

La documentación OpenAPI (Swagger) se encuentra en `src/infrastructure/config/swagger.yml`. Para visualizarla:

1. **Swagger UI**: Copie el contenido del archivo en [Swagger Editor](https://editor.swagger.io/)
2. **API Gateway**: Importe el archivo en la consola de API Gateway
3. **Local**: Use herramientas como `swagger-ui-express` si desea servir la documentación localmente

