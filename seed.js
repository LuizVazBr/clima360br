const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'clima360',
  password: 'postgres',
  port: 5432,
});

async function seed() {
  try {
    // 1. Escolas (Educação)
    await pool.query('DROP TABLE IF EXISTS escolas_educacao CASCADE;');
    await pool.query(`
      CREATE TABLE escolas_educacao (
        id SERIAL PRIMARY KEY,
        escola VARCHAR(255),
        pontuacao INTEGER,
        medalha VARCHAR(50)
      );
    `);
    await pool.query(`INSERT INTO escolas_educacao (escola, pontuacao, medalha) VALUES 
      ('E.M. Machado de Assis', 1250, 'Ouro'),
      ('E.E. Cora Coralina', 980, 'Prata'),
      ('Colegio Virdia Sustentável', 1540, 'Ouro'),
      ('E.M. Tarsila do Amaral', 640, 'Bronze'),
      ('Instituto Educar para o Futuro', 320, '')
    `);
    console.log('escolas_educacao populada.');

    // 2. Transações (Marketplace)
    await pool.query('DROP TABLE IF EXISTS transacoes_mkt CASCADE;');
    await pool.query(`
      CREATE TABLE transacoes_mkt (
        id SERIAL PRIMARY KEY,
        material VARCHAR(255),
        toneladas NUMERIC,
        valor_total NUMERIC
      );
    `);
    await pool.query(`INSERT INTO transacoes_mkt (material, toneladas, valor_total) VALUES 
      ('PET (Fardos)', 2.5, 4500.00),
      ('Papelão Ondulado', 4.0, 3200.00),
      ('Alumínio (Latinhas)', 1.2, 8400.00),
      ('Vidro (Cacos)', 5.5, 1100.00)
    `);
    console.log('transacoes_mkt populada.');

    // 3. Coletas (Recuperação Inteligente)
    await pool.query('DROP TABLE IF EXISTS coletas CASCADE;');
    await pool.query(`
      CREATE TABLE coletas (
        id SERIAL PRIMARY KEY,
        gerador VARCHAR(255),
        volume VARCHAR(255),
        status VARCHAR(50)
      );
    `);
    await pool.query(`INSERT INTO coletas (gerador, volume, status) VALUES 
      ('Supermercado Y', '2 Ton (Papelão)', 'Agendado'),
      ('Shopping Central', '800 Kg (Orgânico)', 'Em Trânsito'),
      ('Condomínio das Flores', '1.2 Ton (Misto)', 'Concluído'),
      ('Indústria Z', '5 Ton (Plástico)', 'Atrasado')
    `);
    console.log('coletas populada.');

    // 4. Catadores
    await pool.query('DROP TABLE IF EXISTS catadores CASCADE;');
    await pool.query(`
      CREATE TABLE catadores (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255),
        cpf VARCHAR(255),
        renda_mensal NUMERIC,
        status VARCHAR(50) DEFAULT 'Ativo'
      );
    `);
    await pool.query(`INSERT INTO catadores (nome, cpf, renda_mensal, status) VALUES 
      ('José Severino', '123.456.789-00', 2150.00, 'Ativo'),
      ('Maria Aparecida', '987.654.321-11', 1840.50, 'Ativo'),
      ('Carlos Eduardo', '456.123.789-22', 3120.00, 'Em análise'),
      ('Ana Beatriz', '789.456.123-33', 1500.00, 'Ativo')
    `);
    console.log('catadores populada.');

    // 5. Cooperativas
    await pool.query('DROP TABLE IF EXISTS cooperativas CASCADE;');
    await pool.query(`
      CREATE TABLE cooperativas (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255),
        endereco VARCHAR(255),
        status VARCHAR(50)
      );
    `);
    await pool.query(`INSERT INTO cooperativas (nome, endereco, status) VALUES 
      ('Cooperativa Recicla Mais', 'Rua das Indústrias, 400', 'Ativa'),
      ('EcoCoop Sul', 'Av. Presidente Vargas, 1200', 'Ativa'),
      ('Associação Verde Vida', 'Travessa Esperança, 45', 'Inativa'),
      ('Virdia Hub Bela Vista', 'Rua Central, 100', 'Ativa')
    `);
    console.log('cooperativas populada.');

  } catch (err) {
    console.error('Erro no seed:', err);
  } finally {
    pool.end();
  }
}

seed();
