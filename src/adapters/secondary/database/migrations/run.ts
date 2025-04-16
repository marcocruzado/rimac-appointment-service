import mysql from 'mysql2/promise';
import { dbs } from '../config/db.config';
import { createAppointmentsTableSQL } from './createTables';

const runMigration = async () => {
  const countries: ('pe' | 'cl')[] = ['pe', 'cl'];

  for (const country of countries) {
    const { host, user, password, database } = dbs[country];

    const rootConnection = await mysql.createConnection({ host, user, password });
    await rootConnection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\``);
    console.log(`🛠️  Base de datos '${database}' verificada/creada`);
    await rootConnection.end();

    const dbConnection = await mysql.createConnection({ host, user, password, database });
    const createTableSQL = createAppointmentsTableSQL(country);
    await dbConnection.execute(createTableSQL);
    console.log(`✅ Tabla appointments_${country} creada en base de datos ${database}`);
    await dbConnection.end();
  }
};

runMigration().catch(err => {
  console.error('❌ Error en la migración:', err);
});
