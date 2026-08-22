import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token não fornecido ou formato inválido.' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];

    const res = await pool.query('SELECT * FROM api_tokens WHERE token = $1 LIMIT 1', [token]);
    
    if (res.rows.length === 0) {
      return NextResponse.json({ error: 'Permissão negada: Token inválido ou inexistente.' }, { status: 401 });
    }

    const tokenData = res.rows[0];
    
    if (!tokenData.active) {
      return NextResponse.json({ error: 'Permissão negada: Token inativo.' }, { status: 403 });
    }

    return NextResponse.json({ valid: true, name: tokenData.name }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
