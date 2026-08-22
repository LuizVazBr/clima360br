import { Pool } from 'pg';

let pool;

if (!global.pgPool) {
  global.pgPool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'clima360',
    password: 'postgres',
    port: 5432,
  });
}

pool = global.pgPool;

export default pool;
