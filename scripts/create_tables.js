const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'clima360',
  password: 'postgres',
  port: 5432,
});

const createTables = async () => {
  try {
    console.log("Conectando ao banco de dados...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS catadores (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        cpf VARCHAR(14) UNIQUE,
        cooperativa_id INTEGER,
        status VARCHAR(50) DEFAULT 'Ativo',
        renda_mensal NUMERIC(10,2) DEFAULT 0.00
      );

      CREATE TABLE IF NOT EXISTS coletas (
        id SERIAL PRIMARY KEY,
        gerador VARCHAR(255),
        volume_estimado NUMERIC(10,2),
        status VARCHAR(50),
        data_coleta TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS triagens (
        id SERIAL PRIMARY KEY,
        lote_id VARCHAR(50),
        percentual_pet NUMERIC(5,2),
        percentual_papel NUMERIC(5,2),
        percentual_rejeito NUMERIC(5,2),
        data_triagem TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS escolas_educacao (
        id SERIAL PRIMARY KEY,
        nome_escola VARCHAR(255),
        pontuacao INTEGER DEFAULT 0,
        medalha VARCHAR(50) DEFAULT 'Bronze'
      );

      CREATE TABLE IF NOT EXISTS transacoes_mkt (
        id SERIAL PRIMARY KEY,
        material VARCHAR(100),
        toneladas NUMERIC(10,2),
        valor_total NUMERIC(10,2),
        comprador VARCHAR(255),
        data_venda TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS consultas_ia (
        id SERIAL PRIMARY KEY,
        pergunta TEXT,
        resposta TEXT,
        data_consulta TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Tabelas criadas com sucesso!");
  } catch (err) {
    console.error("Erro ao criar tabelas:", err);
  } finally {
    await pool.end();
  }
};

createTables();
