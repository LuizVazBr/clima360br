import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET() {
  try {
    const res = await pool.query('SELECT * FROM api_tokens ORDER BY id DESC');
    return NextResponse.json(res.rows);
  } catch(e) {
    return NextResponse.json({error: e.message}, {status: 500});
  }
}

export async function POST(req) {
  try {
    const { name, ip_allowlist } = await req.json();
    
    // Generate secure token (e.g., 32 random bytes as hex)
    const secureToken = 'c360-' + crypto.randomBytes(32).toString('hex');
    const ip = ip_allowlist && ip_allowlist.trim() !== '' ? ip_allowlist : 'Todos';

    const res = await pool.query(
      'INSERT INTO api_tokens (name, token, ip_allowlist, active) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, secureToken, ip, true]
    );

    return NextResponse.json(res.rows[0]);
  } catch(e) {
    return NextResponse.json({error: e.message}, {status: 500});
  }
}

export async function PUT(req) {
  try {
    const { id, name, ip_allowlist, active } = await req.json();
    
    const res = await pool.query(
      'UPDATE api_tokens SET name = $1, ip_allowlist = $2, active = $3 WHERE id = $4 RETURNING *',
      [name, ip_allowlist, active, id]
    );

    return NextResponse.json(res.rows[0]);
  } catch(e) {
    return NextResponse.json({error: e.message}, {status: 500});
  }
}
