const { Client } = require('pg');

async function setup() {
  console.log('Conectando ao banco postgres...');
  // Conecta ao banco default 'postgres' para criar o 'clima360'
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'postgres',
    port: 5432,
  });

  try {
    await client.connect();
    
    // Verifica se o banco clima360 existe
    const res = await client.query("SELECT 1 FROM pg_database WHERE datname = 'clima360'");
    if (res.rowCount === 0) {
      console.log('Criando banco de dados "clima360"...');
      await client.query('CREATE DATABASE clima360');
      console.log('Banco criado com sucesso.');
    } else {
      console.log('Banco "clima360" já existe.');
    }
  } catch (err) {
    console.error('Erro ao conectar ou criar banco:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }

  // Agora conecta no banco 'clima360' para criar as tabelas
  console.log('Conectando ao banco "clima360"...');
  const clima360Client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'clima360',
    password: 'postgres',
    port: 5432,
  });

  try {
    await clima360Client.connect();

    console.log('Criando tabelas...');
    
    await clima360Client.query(`
      CREATE TABLE IF NOT EXISTS cooperativas (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        endereco VARCHAR(200),
        status VARCHAR(50)
      );

      CREATE TABLE IF NOT EXISTS catadores (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        cooperativa_id INTEGER REFERENCES cooperativas(id),
        certificacoes INTEGER DEFAULT 0,
        renda_estimada NUMERIC(10,2) DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS coletas (
        id SERIAL PRIMARY KEY,
        gerador VARCHAR(150),
        volume_kg NUMERIC(10,2),
        contaminacao_perc NUMERIC(5,2),
        data_coleta TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS vendas_marketplace (
        id SERIAL PRIMARY KEY,
        material VARCHAR(100),
        comprador VARCHAR(150),
        valor_total NUMERIC(10,2),
        data_venda TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Tabelas criadas com sucesso!');

    console.log('Inserindo dados simulados (se vazias)...');
    
    // Verifica se tem dados
    const coopRes = await clima360Client.query('SELECT COUNT(*) FROM cooperativas');
    if (parseInt(coopRes.rows[0].count) === 0) {
      await clima360Client.query(`
        INSERT INTO cooperativas (nome, endereco, status) VALUES 
        ('Cooperativa A', 'Rua X, Centro', 'Ativa'),
        ('Ecoponto Central', 'Av Principal', 'Ativa');
        
        INSERT INTO catadores (nome, cooperativa_id, certificacoes, renda_estimada) VALUES
        ('João Silva', 1, 3, 2450.00),
        ('Maria Santos', 1, 5, 3100.50);

        INSERT INTO coletas (gerador, volume_kg, contaminacao_perc) VALUES
        ('Supermercado Y', 150.5, 5.2),
        ('Escola Municipal Z', 45.0, 1.1);

        INSERT INTO vendas_marketplace (material, comprador, valor_total) VALUES
        ('PET Transparente', 'Indústria XYZ', 1500.00),
        ('Papelão Ondulado', 'Recicladora ABC', 850.00);
      `);
      console.log('Dados inseridos com sucesso!');
    } else {
      console.log('Tabelas já contêm dados.');
    }

  } catch (err) {
    console.error('Erro ao configurar tabelas:', err);
  } finally {
    await clima360Client.end();
    console.log('Setup concluído!');
  }
}

setup();
