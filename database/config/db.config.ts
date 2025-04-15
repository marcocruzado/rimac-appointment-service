import dotenv from 'dotenv';
dotenv.config();

export const dbs = {
  pe: {
    host: process.env.MYSQL_HOST_PE!,
    user: process.env.MYSQL_USER_PE!,
    password: process.env.MYSQL_PASSWORD_PE!,
    database: process.env.MYSQL_DATABASE_PE!,
  },
  cl: {
    host: process.env.MYSQL_HOST_CL!,
    user: process.env.MYSQL_USER_CL!,
    password: process.env.MYSQL_PASSWORD_CL!,
    database: process.env.MYSQL_DATABASE_CL!,
  },
};
