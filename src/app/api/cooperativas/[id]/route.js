import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const data = await request.json();
    const { nome, endereco, status } = data;

    const query = `
      UPDATE cooperativas 
      SET nome = $1, endereco = $2, status = $3 
      WHERE id = $4 
      RETURNING *
    `;
    const { rows } = await pool.query(query, [nome, endereco, status, id]);
    
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Cooperativa não encontrada' }, { status: 404 });
    }
    
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Erro no PUT cooperativas:', error);
    return NextResponse.json({ error: 'Erro ao atualizar cooperativa' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    
    const query = 'DELETE FROM cooperativas WHERE id = $1 RETURNING *';
    const { rows } = await pool.query(query, [id]);
    
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Cooperativa não encontrada' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Cooperativa removida com sucesso' });
  } catch (error) {
    console.error('Erro no DELETE cooperativas:', error);
    return NextResponse.json({ error: 'Erro ao deletar cooperativa' }, { status: 500 });
  }
}
