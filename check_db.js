const pool = require('./src/lib/db');
pool.query('SELECT * FROM ouvidoria LIMIT 1').then(r => {
  console.log(r.rows[0]);
  process.exit(0);
});
