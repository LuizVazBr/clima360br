const { Pool } = require('pg');
const pool = new Pool({ user: 'postgres', host: 'localhost', database: 'clima360', password: 'postgres', port: 5432 });

async function seedOuvidoria() {
  try {
    const records = [
      { id: 1, protocolo: 'OUV-2025-001', assunto: 'Alagamento em via pública', descricao: 'A água da chuva cobriu a tesourinha e a pista principal, carros não conseguem passar. Há lixo entupindo o bueiro.', bairro: 'Asa Norte', lat: -15.760, lng: -47.870, data_registro: '2025-01-15' },
      { id: 2, protocolo: 'OUV-2025-002', assunto: 'Incêndio em área verde', descricao: 'Fumaça muito forte e fogo alto próximo à área de cooperativas. Necessário corpo de bombeiros urgente.', bairro: 'Parque da Cidade', lat: -15.794, lng: -47.893, data_registro: '2025-02-10' },
      { id: 3, protocolo: 'OUV-2025-003', assunto: 'Inundação residencial', descricao: 'A água do córrego subiu mais de 1 metro e invadiu três casas da rua principal. Moradores perderam móveis.', bairro: 'Vicente Pires', lat: -15.803, lng: -48.026, data_registro: '2025-02-20' },
      { id: 4, protocolo: 'OUV-2025-004', assunto: 'Queimada ilegal', descricao: 'Lote vazio sendo queimado para desmatamento irregular, fumaça invadindo as quadras residenciais.', bairro: 'Brazlândia', lat: -15.670, lng: -48.200, data_registro: '2025-03-05' },
      { id: 5, protocolo: 'OUV-2025-005', assunto: 'Deslizamento de terra (Área de risco)', descricao: 'Encosta do morro cedeu após fortes chuvas, ameaçando derrubar poste e barraco próximo.', bairro: 'Sol Nascente', lat: -15.828, lng: -48.136, data_registro: '2025-03-12' },
      { id: 6, protocolo: 'OUV-2025-006', assunto: 'Alagamento de tesourinha', descricao: 'Veículo ficou preso embaixo da tesourinha completamente alagada. Trânsito travado.', bairro: 'Asa Sul', lat: -15.820, lng: -47.900, data_registro: '2025-03-15' },
      { id: 7, protocolo: 'OUV-2025-007', assunto: 'Foco de Incêndio', descricao: 'Fogo rasteiro espalhando rápido pela vegetação seca perto da reserva ambiental.', bairro: 'Jardim Botânico', lat: -15.860, lng: -47.780, data_registro: '2025-03-18' }
    ];

    await pool.query("ALTER TABLE ouvidoria ADD COLUMN IF NOT EXISTS descricao TEXT");

    for (const r of records) {
      await pool.query(
        "UPDATE ouvidoria SET protocolo = $1, assunto_nome = $2, descricao = $3, bairro = $4, lat = $5, lng = $6, data_registro = $7 WHERE id = $8",
        [r.protocolo, r.assunto, r.descricao, r.bairro, r.lat, r.lng, r.data_registro, r.id]
      );
    }
    
    console.log('Ouvidoria seeded with descriptions!');
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
seedOuvidoria();
