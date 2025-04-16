import * as mysql from 'mysql2/promise';
import { CountryISO } from '../../domain/entities/Appointment';

export async function createMySQLConnections(): Promise<{ [key: string]: mysql.Connection }> {
  const connections: { [key: string]: mysql.Connection } = {};

  const peConfig = {
    host: process.env.MYSQL_HOST_PE,
    user: process.env.MYSQL_USER_PE,
    password: process.env.MYSQL_PASSWORD_PE,
    database: process.env.MYSQL_DATABASE_PE,
    port: Number(process.env.MYSQL_PORT_PE) || 3306
  };

  const clConfig = {
    host: process.env.MYSQL_HOST_CL,
    user: process.env.MYSQL_USER_CL,
    password: process.env.MYSQL_PASSWORD_CL,
    database: process.env.MYSQL_DATABASE_CL,
    port: Number(process.env.MYSQL_PORT_CL) || 3306
  };

  try {
    connections[CountryISO.PE] = await mysql.createConnection(peConfig);
    connections[CountryISO.CL] = await mysql.createConnection(clConfig);

    return connections;
  } catch (error) {
    console.error('Error al crear conexiones MySQL:', error);
    throw error;
  }
} 