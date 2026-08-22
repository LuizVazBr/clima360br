const { Pool } = require('pg');
const pool = new Pool({ user: 'postgres', host: 'localhost', database: 'clima360', password: 'postgres', port: 5432 });

async function fixDB() {
  try {
    const resSisdia = await pool.query("SELECT * FROM climate_sources WHERE name ILIKE '%SISDIA%'");
    if (resSisdia.rows.length === 0) {
      await pool.query("INSERT INTO climate_sources (name, description, urls, type) VALUES ('SISDIA', 'Sistema Distrital de Informações Ambientais (Áreas de Risco / Defesa Civil)', '[\"https://sisdia.df.gov.br/home/dados-e-informacoes/\"]', 'api')");
    }

    const resAdapta = await pool.query("SELECT * FROM climate_sources WHERE name ILIKE '%Adapta Brasil%'");
    if (resAdapta.rows.length === 0) {
      await pool.query("INSERT INTO climate_sources (name, description, urls, type) VALUES ('Adapta Brasil MCTI', 'Plataforma que unifica e analisa os impactos das mudanças climáticas no Brasil.', '[\"https://sistema.adaptabrasil.mcti.gov.br/\"]', 'api')");
    }

    // Let's also check if "INPE - BDQueimadas" is specifically there
    const resInpeBD = await pool.query("SELECT * FROM climate_sources WHERE name ILIKE '%BDQueimadas%'");
    if (resInpeBD.rows.length === 0) {
       await pool.query("INSERT INTO climate_sources (name, description, urls, type) VALUES ('INPE - BDQueimadas', 'Monitoramento oficial de focos de queimadas e incêndios florestais.', '[\"https://terrabrasilis.dpi.inpe.br/queimadas/bdqueimadas/\"]', 'api')");
    }
    
    console.log('DB fixed');
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
fixDB();
