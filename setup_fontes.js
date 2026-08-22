const { Pool } = require('pg');
const pool = new Pool({ user: 'postgres', host: 'localhost', database: 'clima360', password: 'postgres', port: 5432 });

async function init() {
  try {
    const result = await pool.query("SELECT * FROM climate_sources WHERE type = 'info'");
    if (result.rows.length === 0) {
      await pool.query("INSERT INTO climate_sources (name, description, urls, type, keywords) VALUES ($1, $2, $3, $4, $5)", ['SEMA DF', 'Secretaria do Meio Ambiente do DF', JSON.stringify(['https://www.sema.df.gov.br/']), 'info', 'meio ambiente, df, secretarias']);
      await pool.query("INSERT INTO climate_sources (name, description, urls, type, keywords) VALUES ($1, $2, $3, $4, $5)", ['Portal DF', 'Portal do Governo do Distrito Federal', JSON.stringify(['https://df.gov.br/']), 'info', 'governo, portal, noticias df']);
      await pool.query("INSERT INTO climate_sources (name, description, urls, type, keywords) VALUES ($1, $2, $3, $4, $5)", ['SINJ DF', 'Sistema de Informação de Normas Jurídicas', JSON.stringify(['https://www.sinj.df.gov.br/sinj/']), 'info', 'ofícios, leis, normas']);
      console.log('Inserted mocks');
    } else {
      console.log('Mocks already inserted');
    }
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
init();
