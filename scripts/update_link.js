const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'clima360',
  password: 'postgres',
  port: 5432,
});

async function run() {
  try {
    await pool.query(
      "UPDATE climate_sources SET urls = $1 WHERE name = 'Portal da Transparência'",
      [JSON.stringify(['https://api.portaldatransparencia.gov.br/swagger-ui/index.html'])]
    );
    console.log("Portal da Transparência link updated.");
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
run();
