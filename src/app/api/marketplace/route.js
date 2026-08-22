import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request) {
  try {
    const { rows } = await pool.query('SELECT * FROM transacoes_mkt ORDER BY id DESC LIMIT 50');
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const query = 'INSERT INTO transacoes_mkt (material, toneladas, valor_total) VALUES ($1, $2, $3) RETURNING *';
    const { rows } = await pool.query(query, [data.material, data.toneladas, data.valor_total]);
    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar' }, { status: 500 });
  }
}