import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    let query = 'SELECT * FROM cooperativas ORDER BY id DESC';
    let values = [];

    if (search) {
      query = 'SELECT * FROM cooperativas WHERE nome ILIKE $1 OR endereco ILIKE $1 ORDER BY id DESC';
      values = [`%${search}%`];
    }

    const { rows } = await pool.query(query, values);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Erro no GET cooperativas:', error);
    return NextResponse.json({ error: 'Erro ao buscar cooperativas' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const { nome, endereco, status } = data;

    const query = `
      INSERT INTO cooperativas (nome, endereco, status) 
      VALUES ($1, $2, $3) 
      RETURNING *
    `;
    const { rows } = await pool.query(query, [nome, endereco, status]);
    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    console.error('Erro no POST cooperativas:', error);
    return NextResponse.json({ error: 'Erro ao criar cooperativa' }, { status: 500 });
  }
}
