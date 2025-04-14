import * as mysql from 'mysql2/promise';
import * as fs from 'fs';
import * as path from 'path';

// Cargar variables de entorno
require('dotenv').config();

async function executeMigrations() {
  // Configuraciones de conexión
  const configs = [
    {
      host: process.env.MYSQL_HOST_PE || 'localhost',
      user: process.env.MYSQL_USER_PE || 'root',
      password: process.env.MYSQL_PASSWORD_PE || 'root',
      database: process.env.MYSQL_DATABASE_PE || 'rimac_appointments_pe',
      port: parseInt(process.env.MYSQL_PORT_PE || '3306'),
      country: 'PE'
    },
    {
      host: process.env.MYSQL_HOST_CL || 'localhost',
      user: process.env.MYSQL_USER_CL || 'root',
      password: process.env.MYSQL_PASSWORD_CL || 'root',
      database: process.env.MYSQL_DATABASE_CL || 'rimac_appointments_cl',
      port: parseInt(process.env.MYSQL_PORT_CL || '3306'),
      country: 'CL'
    }
  ];

  // Leer el archivo SQL
  const sqlPath = path.join(__dirname, '..', 'migrations', 'create_tables.sql');
  const sqlContent = fs.readFileSync(sqlPath, 'utf8');

  // Ejecutar migraciones para cada país
  for (const config of configs) {
    console.log(`\nEjecutando migraciones para ${config.country}...`);
    
    try {
      // Crear conexión
      const connection = await mysql.createConnection({
        host: config.host,
        user: config.user,
        password: config.password,
        port: config.port
      });

      // Crear base de datos si no existe
      await connection.query(`CREATE DATABASE IF NOT EXISTS ${config.database}`);
      await connection.query(`USE ${config.database}`);
      
      // Ejecutar migraciones
      await connection.query(sqlContent);
      
      console.log(`✅ Migraciones completadas exitosamente para ${config.country}`);
      
      // Cerrar conexión
      await connection.end();
    } catch (error) {
      console.error(`❌ Error en migraciones para ${config.country}:`, error);
      process.exit(1);
    }
  }

  console.log('\n✨ Todas las migraciones han sido completadas');
}

// Ejecutar migraciones
executeMigrations().catch(error => {
  console.error('Error al ejecutar migraciones:', error);
  process.exit(1);
}); 