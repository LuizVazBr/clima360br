import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await pool.query(`SELECT value FROM system_configs WHERE key = 'map_center'`);
    if (res.rows.length > 0) {
      return NextResponse.json(res.rows[0].value);
    }
    return NextResponse.json({ lat: -15.7938, lng: -47.8828 });
  } catch (error) {
    return NextResponse.json({ lat: -15.7938, lng: -47.8828 }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { lat, lng } = await req.json();
    await pool.query(
      `INSERT INTO system_configs (key, value) VALUES ('map_center', $1) 
       ON CONFLICT (key) DO UPDATE SET value = $1`,
      [JSON.stringify({ lat: Number(lat), lng: Number(lng) })]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao salvar configuração' }, { status: 500 });
  }
}
