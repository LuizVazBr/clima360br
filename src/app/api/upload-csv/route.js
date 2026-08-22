import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import Papa from 'papaparse';

export async function POST(req) {
  try {
    const data = await req.formData();
    const file = data.get('file');
    const type = data.get('type');
    
    if(!file) return NextResponse.json({ error: 'Nenhum arquivo' }, { status: 400 });

    const text = await file.text();
    const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
    
    const rows = parsed.data;
    if(rows.length === 0) return NextResponse.json({ error: 'CSV vazio' }, { status: 400 });

    let diff_msg = '';

    if (type === 'painel-clima') {
      // Comparativo: média antiga
      const oldAvgRes = await pool.query(`SELECT AVG(NULLIF(score_value, '')::numeric) as val FROM painel_clima_brasil`);
      const oldAvg = parseFloat(oldAvgRes.rows[0].val || 0);

      // Limpar e Inserir
      await pool.query('TRUNCATE TABLE painel_clima_brasil');
      for (const row of rows) {
        // Fallback for missing cols
        const score_value = row.score_value || row.ValorNumérico || row.valor || '';
        await pool.query(
          `INSERT INTO painel_clima_brasil (axis_name, entity_type, entity_name, component_identifier, item_identifier, score_text, score_value) 
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [row.axis_name || row.Eixo || 'N/A', row.entity_type || 'Estado', row.entity_name || 'N/A', row.component_identifier || 'C1', row.item_identifier || 'I1', row.score_text || '', score_value]
        );
      }
      
      const newAvgRes = await pool.query(`SELECT AVG(NULLIF(score_value, '')::numeric) as val FROM painel_clima_brasil`);
      const newAvg = parseFloat(newAvgRes.rows[0].val || 0);
      const diff = newAvg - oldAvg;
      
      if(diff > 0) diff_msg = `Score global subiu +${(diff*100).toFixed(1)}% (Melhorou!)`;
      else if (diff < 0) diff_msg = `Score global caiu ${(diff*100).toFixed(1)}% (Piorou)`;
      else diff_msg = `Score global manteve-se estável.`;

    } else if (type === 'ouvidoria') {
      // Comparativo: quantidade antiga
      const oldCountRes = await pool.query(`SELECT COUNT(*) FROM ouvidoria`);
      const oldCount = parseInt(oldCountRes.rows[0].count);

      await pool.query('TRUNCATE TABLE ouvidoria');
      for (const row of rows) {
        await pool.query(
          `INSERT INTO ouvidoria (protocolo, assunto_id, assunto_nome, bairro, status, lat, lng) 
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [row.protocolo || 'N/A', row.assunto_id || row.assuntoId || '900', row.assunto_nome || row.assuntoNome || 'Outros', row.bairro || 'Desconhecido', row.status || 'Aberto', parseFloat(row.lat || 0), parseFloat(row.lng || 0)]
        );
      }

      const diff = rows.length - oldCount;
      if (diff > 0) diff_msg = `+${diff} novas ocorrências mapeadas na região.`;
      else if (diff < 0) diff_msg = `${Math.abs(diff)} ocorrências foram mitigadas/removidas. (Melhorou!)`;
      else diff_msg = `O volume de ocorrências permanece o mesmo.`;
    }

    // Salvar no historico
    await pool.query(
      `INSERT INTO upload_history (file_name, upload_type, total_records, metrics) VALUES ($1, $2, $3, $4)`,
      [file.name, type, rows.length, JSON.stringify({ diff_msg })]
    );

    return NextResponse.json({ success: true, total: rows.length, diff_msg });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro processando CSV: ' + error.message }, { status: 500 });
  }
}
