import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'clima360',
  password: 'postgres',
  port: 5432,
});

export async function GET() {
  try {
    const result = await pool.query('SELECT * FROM climate_sources ORDER BY id ASC');
    return NextResponse.json(result.rows);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, desc, links, type = 'api', keywords = '' } = body;

    const urls = Array.isArray(links) ? links : [links];

    const result = await pool.query(
      "INSERT INTO climate_sources (name, description, urls, type, keywords) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, desc, JSON.stringify(urls), type, keywords]
    );

    return NextResponse.json(result.rows[0]);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, name, desc, links, type = 'api', keywords = '' } = body;

    const urls = Array.isArray(links) ? links : [links];

    const result = await pool.query(
      "UPDATE climate_sources SET name = $1, description = $2, urls = $3, type = $4, keywords = $5 WHERE id = $6 RETURNING *",
      [name, desc, JSON.stringify(urls), type, keywords, id]
    );

    return NextResponse.json(result.rows[0]);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
