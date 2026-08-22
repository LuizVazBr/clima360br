const { Pool } = require('pg');
const pool = new Pool({ user: 'postgres', host: 'localhost', database: 'clima360', password: 'postgres', port: 5432 });

async function setupTokens() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS api_tokens (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        token VARCHAR(500) NOT NULL UNIQUE,
        ip_allowlist VARCHAR(255) DEFAULT 'Todos',
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Tabela api_tokens criada com sucesso!');
  } catch (error) {
    console.error('Erro ao criar tabela:', error);
  } finally {
    pool.end();
  }
}
setupTokens();
