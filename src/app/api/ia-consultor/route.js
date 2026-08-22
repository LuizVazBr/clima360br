import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request) {
  try {
    const { rows } = await pool.query('SELECT * FROM consultas_ia ORDER BY id ASC LIMIT 50');
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const query = 'INSERT INTO consultas_ia (pergunta, resposta) VALUES ($1, $2) RETURNING *';
    const { rows } = await pool.query(query, [data.pergunta, data.resposta]);
    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao salvar conversa' }, { status: 500 });
  }
}