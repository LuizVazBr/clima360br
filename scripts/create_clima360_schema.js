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
    console.log("Criando novas tabelas de fontes e dados normalizados...");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS climate_sources (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        update_frequency VARCHAR(100)
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS normalized_climate_data (
        id SERIAL PRIMARY KEY,
        source_id INTEGER REFERENCES climate_sources(id),
        source_date TIMESTAMP,
        indicator VARCHAR(255),
        entity VARCHAR(255),
        raw_value TEXT,
        normalized_value NUMERIC,
        original_data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("Tabelas criadas com sucesso.");

    // Inserir fontes obrigatórias
    const sources = [
      { name: 'Painel ClimaBrasil', description: 'Dados oficiais sobre governança e políticas públicas climáticas' },
      { name: 'INMET', description: 'Instituto Nacional de Meteorologia - Previsão, Temperatura e Chuva' },
      { name: 'CEMADEN', description: 'Centro Nacional de Monitoramento e Alertas de Desastres Naturais' },
      { name: 'INPE', description: 'Programa Queimadas e Monitoramento' },
      { name: 'NASA', description: 'Earthdata / GIBS - Observação da Terra' },
      { name: 'ANA', description: 'Agência Nacional de Águas e Saneamento Básico' },
      { name: 'MapBiomas', description: 'Cobertura e Uso da Terra' },
      { name: 'Portal da Transparência', description: 'Despesas e repasses financeiros públicos' }
    ];

    for (const src of sources) {
      await pool.query(`
        INSERT INTO climate_sources (name, description)
        SELECT $1::VARCHAR, $2::TEXT
        WHERE NOT EXISTS (
          SELECT 1 FROM climate_sources WHERE name = $1::VARCHAR
        )
      `, [src.name, src.description]);
    }

    console.log("Fontes de dados cadastradas com sucesso.");
  } catch (error) {
    console.error("Erro ao criar esquema Clima360:", error);
  } finally {
    pool.end();
  }
}

run();
