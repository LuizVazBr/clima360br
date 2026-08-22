import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request) {
  try {
    const { rows } = await pool.query('SELECT * FROM catadores ORDER BY id DESC');
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const query = 'INSERT INTO catadores (nome, cpf, cooperativa_id, renda_mensal) VALUES ($1, $2, $3, $4) RETURNING *';
    const { rows } = await pool.query(query, [data.nome, data.cpf, data.cooperativa_id, data.renda_mensal || 0]);
    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar' }, { status: 500 });
  }
}
