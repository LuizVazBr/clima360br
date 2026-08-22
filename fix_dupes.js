const { Pool } = require('pg');
const pool = new Pool({ user: 'postgres', host: 'localhost', database: 'clima360', password: 'postgres', port: 5432 });

async function fixDupes() {
  try {
    const res = await pool.query('SELECT * FROM climate_sources');
    const sources = res.rows;

    const cemadens = sources.filter(s => s.name.toUpperCase().includes('CEMADEN'));
    if (cemadens.length > 1) {
      for (let i = 1; i < cemadens.length; i++) {
        await pool.query('DELETE FROM climate_sources WHERE id = $1', [cemadens[i].id]);
      }
    }

    const inpes = sources.filter(s => s.name.toUpperCase().includes('INPE'));
    if (inpes.length > 1) {
      const toKeep = inpes.find(i => i.name === 'INPE') || inpes[0];
      for (let i = 0; i < inpes.length; i++) {
        if (inpes[i].id !== toKeep.id) {
          await pool.query('DELETE FROM climate_sources WHERE id = $1', [inpes[i].id]);
        }
      }
    }

    console.log('Duplicates removed');
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
fixDupes();
