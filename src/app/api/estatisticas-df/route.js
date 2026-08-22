import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await pool.query(`
      SELECT axis_name, 
             (SUM(COALESCE(NULLIF(score_value, ''), '0')::numeric) / COUNT(item_identifier)) as avg_score
      FROM painel_clima_brasil
      WHERE entity_name ILIKE '%Distrito Federal%'
      GROUP BY axis_name
    `);
    
    const stats = res.rows.map(row => ({
      axis: row.axis_name,
      percentage: Math.round(Number(row.avg_score) * 100)
    }));
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao buscar estatisticas' }, { status: 500 });
  }
}
