const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'clima360',
  password: 'postgres',
  port: 5432,
});

const FONTES_MOCK = [
  { name: 'Painel ClimaBrasil', desc: 'Dados oficiais sobre governança e políticas públicas climáticas', links: ['https://painel.climabrasil.gov.br'], date: '2026-08-21' },
  { name: 'INMET', desc: 'Instituto Nacional de Meteorologia - Previsão, Temperatura e Chuva', links: ['https://apitempo.inmet.gov.br', 'https://satelite.inmet.gov.br/'], date: '2026-08-21' },
  { name: 'CEMADEN', desc: 'Centro Nacional de Monitoramento e Alertas de Desastres Naturais', links: ['https://painelalertas.cemaden.gov.br/'], date: '2026-08-21' },
  { name: 'INPE', desc: 'Programa Queimadas e Monitoramento', links: ['https://terrabrasilis.dpi.inpe.br/queimadas/bdqueimadas/'], date: '2026-08-21' },
  { name: 'NASA', desc: 'Earthdata / GIBS - Observação da Terra', links: ['https://gibs.earthdata.nasa.gov/wmts'], date: '2026-08-21' },
  { name: 'ANA', desc: 'Agência Nacional de Águas e Saneamento Básico', links: ['https://hidrosat.ana.gov.br/', 'https://www.snirh.gov.br/hidrotelemetria/Mapa.aspx'], date: '2026-08-21' },
  { name: 'MapBiomas', desc: 'Cobertura e Uso da Terra', links: ['https://plataforma.mapbiomas.org/projects/mapbiomas/brazil?t[regionKey]=brazil&t[divisionCategoryId]=213'], date: '2026-08-21' },
  { name: 'Portal da Transparência', desc: 'Despesas e repasses financeiros públicos', links: ['https://portaldatransparencia.gov.br'], date: '2026-08-21' },
];

async function run() {
  try {
    await pool.query("ALTER TABLE climate_sources ADD COLUMN IF NOT EXISTS urls JSONB DEFAULT '[]'::jsonb;");
    await pool.query("ALTER TABLE climate_sources ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;");
    
    // Deleta os antigos pra não duplicar mock
    await pool.query("DELETE FROM normalized_climate_data;");
    await pool.query("DELETE FROM climate_sources;");

    for (const f of FONTES_MOCK) {
      await pool.query(
        "INSERT INTO climate_sources (name, description, urls, created_at) VALUES ($1, $2, $3, $4)",
        [f.name, f.desc, JSON.stringify(f.links), f.date]
      );
    }
    console.log("Banco atualizado com as fontes!");
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
run();
