const { Pool } = require('pg');
const pool = new Pool({ user: 'postgres', host: 'localhost', database: 'clima360', password: 'postgres', port: 5432 });

async function generateMore() {
  const bairros = ['Asa Sul', 'Asa Norte', 'Guará', 'Taguatinga', 'Ceilândia', 'Samambaia', 'Gama', 'Planaltina', 'Sobradinho', 'Paranoá', 'Brazlândia', 'Lago Sul', 'Lago Norte'];
  const assuntos = ['Foco de Incêndio', 'Alagamento em via pública', 'Deslizamento de encosta', 'Árvore caída', 'Inundação residencial', 'Queimada ilegal'];
  
  for(let i=8; i<=58; i++) {
    const b = bairros[Math.floor(Math.random()*bairros.length)];
    const a = assuntos[Math.floor(Math.random()*assuntos.length)];
    // bounding box around DF roughly
    const lat = -15.79 + (Math.random() - 0.5) * 0.4;
    const lng = -47.88 + (Math.random() - 0.5) * 0.4;
    
    await pool.query(
      "INSERT INTO ouvidoria (protocolo, assunto_nome, descricao, bairro, lat, lng, data_registro) VALUES ($1, $2, $3, $4, $5, $6, $7)",
      [`OUV-2025-${i.toString().padStart(3, '0')}`, a, `Cidadão reportou ${a} em ${b} prejudicando a rotina.`, b, lat, lng, '2025-03-20']
    );
  }
  console.log("Inseridos 50");
  pool.end();
}
generateMore();
