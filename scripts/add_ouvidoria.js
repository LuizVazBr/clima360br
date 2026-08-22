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
      "INSERT INTO climate_sources (name, description, urls) VALUES ($1, $2, $3)",
      ['Ouvidoria GDF', 'Dados abertos do sistema de ouvidoria do Distrito Federal', JSON.stringify(['https://www.dados.df.gov.br/pt/dataset#/dados-abertos-do-sistema-de-ouvidoria-ouv-df'])]
    );
    console.log("Ouvidoria GDF added.");
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
run();
