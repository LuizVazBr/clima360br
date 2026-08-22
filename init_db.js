const { Pool } = require('pg'); 
const pool = new Pool({ user: 'postgres', host: 'localhost', database: 'clima360', password: 'postgres', port: 5432 }); 
async function initDB() { 
  try { 
    await pool.query(`CREATE TABLE IF NOT EXISTS system_configs (key VARCHAR(255) PRIMARY KEY, value JSONB);`); 
    await pool.query(`INSERT INTO system_configs (key, value) VALUES ('map_center', '{"lat": -15.7938, "lng": -47.8828}') ON CONFLICT DO NOTHING;`); 
    await pool.query(`CREATE TABLE IF NOT EXISTS upload_history (id SERIAL PRIMARY KEY, file_name VARCHAR(255), upload_type VARCHAR(50), total_records INT, metrics JSONB, upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`); 
    await pool.query(`CREATE TABLE IF NOT EXISTS ouvidoria (id SERIAL PRIMARY KEY, protocolo VARCHAR(50), assunto_id VARCHAR(50), assunto_nome VARCHAR(255), bairro VARCHAR(255), status VARCHAR(100), lat DECIMAL(10,8), lng DECIMAL(11,8));`); 
    
    // Check if we have data in ouvidoria, if not, let's inject from ouvidoria_data.json
    const ouviCount = await pool.query(`SELECT COUNT(*) FROM ouvidoria`);
    if (parseInt(ouviCount.rows[0].count) === 0) {
      const fs = require('fs');
      const path = require('path');
      const dataPath = path.join(__dirname, 'public', 'ouvidoria_data.json');
      if (fs.existsSync(dataPath)) {
        const raw = fs.readFileSync(dataPath, 'utf8');
        const json = JSON.parse(raw);
        for (const item of json) {
          // just mock insert to have something
          await pool.query(`INSERT INTO ouvidoria (protocolo, assunto_id, assunto_nome, bairro, status) VALUES ($1, $2, $3, $4, $5)`,
          [item.protocolo, item.assuntoId, item.assuntoNome, item.bairro, item.status]);
        }
      }
    }
    
    console.log('DB Initialized'); 
  } catch(e) { 
    console.error(e); 
  } finally { 
    pool.end(); 
  } 
} 
initDB();
