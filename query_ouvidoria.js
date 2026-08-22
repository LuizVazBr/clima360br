const { Pool } = require('pg');
const pool = new Pool({ user: 'postgres', host: 'localhost', database: 'clima360', password: 'postgres', port: 5432 });
pool.query("SELECT * FROM ouvidoria LIMIT 20").then(res => { console.log(JSON.stringify(res.rows, null, 2)); pool.end(); }).catch(e => { console.error(e); pool.end(); });
