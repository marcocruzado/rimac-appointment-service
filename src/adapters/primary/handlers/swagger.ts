import { APIGatewayProxyHandler } from 'aws-lambda';
import * as fs from 'fs';
import * as path from 'path';

const swaggerHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>RIMAC Appointment Service - API Documentation</title>
    <link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui.min.css" >
    <style>
        body {
            margin: 0;
            padding: 0;
        }
    </style>
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-bundle.min.js"> </script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-standalone-preset.min.js"> </script>
    <script>
        window.onload = function() {
            const ui = SwaggerUIBundle({
                url: "SWAGGER_URL",
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIStandalonePreset
                ],
                plugins: [
                    SwaggerUIBundle.plugins.DownloadUrl
                ],
                layout: "StandaloneLayout"
            });
            window.ui = ui;
        }
    </script>
</body>
</html>
`;

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    // Obtener la URL base de API Gateway
    const baseUrl = `https://${event.requestContext.domainName}/${event.requestContext.stage}`;
    
    // Si se solicita el archivo swagger.yml
    if (event.path === '/docs/swagger.yml') {
      const swaggerPath = path.join(__dirname, '../../../infrastructure/config/swagger.yml');
      const swaggerContent = fs.readFileSync(swaggerPath, 'utf8');
      
      // Actualizar las URLs de los servidores con la URL real de API Gateway
      const updatedSwagger = swaggerContent.replace(
        /url: https:\/\/api\.example\.com\/(dev|prod)/g,
        `url: ${baseUrl}`
      );
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/yaml',
          'Access-Control-Allow-Origin': '*'
        },
        body: updatedSwagger
      };
    }
    
    // Para la página principal de Swagger UI
    const html = swaggerHtml.replace(
      'SWAGGER_URL',
      `${baseUrl}/docs/swagger.yml`
    );
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html',
        'Access-Control-Allow-Origin': '*'
      },
      body: html
    };
  } catch (error) {
    console.error('Error serving Swagger documentation:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Error al cargar la documentación'
      })
    };
  }
}; 