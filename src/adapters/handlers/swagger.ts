import { APIGatewayProxyHandler } from 'aws-lambda';
import YAML from 'yamljs';
import * as path from 'path';

const swaggerDocument = YAML.load(path.join(__dirname, '../../../swagger.yml'));

const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Rimac Appointment Service - API Documentation</title>
    <link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.css" >
    <style>
        body {
            margin: 0;
            padding: 0;
        }
    </style>
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui-bundle.js"> </script>
    <script>
        window.onload = () => {
            const ui = SwaggerUIBundle({
                spec: ${JSON.stringify(swaggerDocument)},
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIBundle.SwaggerUIStandalonePreset
                ],
            })
            window.ui = ui
        }
    </script>
</body>
</html>`;

export const handler: APIGatewayProxyHandler = async () => {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: html
  };
}; 