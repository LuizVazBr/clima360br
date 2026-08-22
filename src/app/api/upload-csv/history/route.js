import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await pool.query('SELECT * FROM upload_history ORDER BY upload_date DESC LIMIT 50');
    return NextResponse.json(res.rows);
  } catch(e) {
    return NextResponse.json({error: 'Erro'}, {status: 500});
  }
}
