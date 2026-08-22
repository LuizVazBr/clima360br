import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '500', 10);
    const offset = (page - 1) * limit;

    const res = await pool.query(
      "SELECT * FROM ouvidoria WHERE assunto_nome ILIKE '%alagamento%' OR assunto_nome ILIKE '%incêndio%' OR assunto_nome ILIKE '%inunda%' OR assunto_nome ILIKE '%queimada%' OR assunto_nome ILIKE '%deslizamento%' OR assunto_nome ILIKE '%árvore%' ORDER BY id ASC LIMIT $1 OFFSET $2",
      [limit, offset]
    );
    return NextResponse.json(res.rows);
  } catch(e) {
    return NextResponse.json({error: 'Erro'}, {status: 500});
  }
}

export async function POST(req) {
  try {
    const data = await req.json();
    const protocolo = data.protocolo || 'CLI-' + Date.now().toString().slice(-6);
    const assunto = data.assunto_nome || 'Alagamento (Cobrança)';
    const bairro = data.bairro || 'DF';
    const desc = data.descricao || 'Ocorrência registrada via app';
    const lat = data.latitude || -15.7975;
    const lon = data.longitude || -47.8919;
    
    // Insert into DB
    const res = await pool.query(
      `INSERT INTO ouvidoria (protocolo, assunto_nome, bairro, localidade, latitude, longitude) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [protocolo, assunto, bairro, desc, lat, lon]
    );

    return NextResponse.json(res.rows[0]);
  } catch(e) {
    console.error('Error inserting ouvidoria:', e);
    return NextResponse.json({error: 'Erro ao inserir'}, {status: 500});
  }
}
