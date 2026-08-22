import pool from '@/lib/db';
import DashboardClient from './DashboardClient';

export default async function PainelClima() {
  // Buscar OS DADOS APENAS DO PAINEL CLIMA BRASIL, IGNORANDO O CLIMATE SCANNER
  const painelRes = await pool.query(`
    SELECT id, axis_name, entity_type, entity_name, component_identifier, item_identifier, score_text, score_value 
    FROM painel_clima_brasil 
    ORDER BY entity_name, axis_name, component_identifier, item_identifier
  `);
  
  return <DashboardClient data={painelRes.rows} />;
}

