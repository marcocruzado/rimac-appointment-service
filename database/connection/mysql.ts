import mysql from 'mysql2/promise';
import { dbs } from '../config/db.config';

export const createConnection = async (country: 'pe' | 'cl') => {
  const config = dbs[country];
  return await mysql.createConnection(config);
};
