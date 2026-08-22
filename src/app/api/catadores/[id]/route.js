import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const data = await request.json();
    const query = 'UPDATE catadores SET nome = $1, cpf = $2, renda_mensal = $3 WHERE id = $4 RETURNING *';
    const { rows } = await pool.query(query, [data.nome, data.cpf, data.renda_mensal || 0, id]);
    return NextResponse.json(rows[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    await pool.query('DELETE FROM catadores WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao deletar' }, { status: 500 });
  }
}
