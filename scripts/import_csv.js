const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'clima360',
  password: 'postgres',
  port: 5432,
});

async function importCsvToTable(filePath, tableName) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
          if (results.length === 0) {
            return resolve();
          }
          
          const columns = Object.keys(results[0]);
          
          // Create table dynamically
          const createTableQuery = `
            CREATE TABLE IF NOT EXISTS ${tableName} (
              id SERIAL PRIMARY KEY,
              ${columns.map(col => `"${col}" TEXT`).join(',\n              ')}
            );
          `;
          await client.query(createTableQuery);
          await client.query(`TRUNCATE TABLE ${tableName}`);
          
          console.log(`Inserindo ${results.length} linhas na tabela ${tableName}...`);
          
          // Batch insert
          const batchSize = 1000;
          for (let i = 0; i < results.length; i += batchSize) {
            const batch = results.slice(i, i + batchSize);
            const values = [];
            const placeholders = [];
            
            let paramIndex = 1;
            for (const row of batch) {
              const rowPlaceholders = [];
              for (const col of columns) {
                values.push(row[col]);
                rowPlaceholders.push(`$${paramIndex++}`);
              }
              placeholders.push(`(${rowPlaceholders.join(', ')})`);
            }
            
            const insertQuery = `
              INSERT INTO ${tableName} (${columns.map(c => `"${c}"`).join(', ')})
              VALUES ${placeholders.join(', ')}
            `;
            await client.query(insertQuery, values);
            console.log(`Inserido lote ${i} - ${i + batch.length} em ${tableName}`);
          }
          
          console.log(`Tabela ${tableName} concluída com sucesso!`);
          resolve();
        } catch (err) {
          console.error(`Erro ao importar ${tableName}:`, err);
          reject(err);
        }
      });
  });
}

async function run() {
  try {
    await client.connect();
    console.log('Conectado ao banco clima360.');
    
    await importCsvToTable(path.join(__dirname, '../public/PainelClimaBrasil-raw-data.csv'), 'painel_clima_brasil');
    await importCsvToTable(path.join(__dirname, '../public/ClimateScanner-raw-data.csv'), 'climate_scanner');
    
  } catch (err) {
    console.error('Erro geral:', err);
  } finally {
    await client.end();
    console.log('Processo finalizado.');
  }
}

run();
