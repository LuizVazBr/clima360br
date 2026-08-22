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
      "UPDATE climate_sources SET urls = $1 WHERE name = 'Painel ClimaBrasil'",
      [JSON.stringify(['https://climatescanner.org/pt/panorama-local-do-brasil/estados/full-evaluation/distrito-federal'])]
    );
    console.log("Painel ClimaBrasil link updated.");
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
run();
