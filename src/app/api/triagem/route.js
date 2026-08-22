import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request) {
  try {
    const { rows } = await pool.query('SELECT * FROM triagens ORDER BY id DESC LIMIT 50');
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const query = 'INSERT INTO triagens (lote_id, percentual_pet, percentual_papel, percentual_rejeito) VALUES ($1, $2, $3, $4) RETURNING *';
    const { rows } = await pool.query(query, [data.lote_id, data.percentual_pet, data.percentual_papel, data.percentual_rejeito]);
    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar' }, { status: 500 });
  }
}