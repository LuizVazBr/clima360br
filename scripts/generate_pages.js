const fs = require('fs');
const path = require('path');

const modules = [
  { name: 'recuperacao', title: 'Recuperação Inteligente', subtitle: 'Otimização de Rotas e Coletas', table: 'coletas', icon: 'Truck', cols: ['ID', 'Gerador', 'Volume', 'Status'] },
  { name: 'triagem', title: 'Triagem Inteligente', subtitle: 'Visão Computacional na Esteira', table: 'triagens', icon: 'ScanEye', cols: ['ID', 'Lote', 'PET (%)', 'Rejeito (%)'] },
  { name: 'educacao', title: 'Educação Ambiental', subtitle: 'Portais e Gamificação', table: 'escolas_educacao', icon: 'BookOpen', cols: ['ID', 'Escola', 'Pontuação', 'Medalha'] },
  { name: 'marketplace', title: 'Marketplace Circular', subtitle: 'Venda de Recicláveis', table: 'transacoes_mkt', icon: 'Store', cols: ['ID', 'Material', 'Toneladas', 'Valor'] },
  { name: 'ia-consultor', title: 'Consultor Municipal IA', subtitle: 'Geração de Insights', table: 'consultas_ia', icon: 'Brain', cols: ['ID', 'Pergunta', 'Resposta', 'Data'] },
];

modules.forEach(mod => {
  const dirPath = path.join(__dirname, '..', 'src', 'app', mod.name);
  const apiPath = path.join(__dirname, '..', 'src', 'app', 'api', mod.name);
  
  fs.mkdirSync(dirPath, { recursive: true });
  fs.mkdirSync(apiPath, { recursive: true });

  // Page
  const pageContent = `"use client";
import { useState, useEffect } from 'react';
import { ${mod.icon}, Plus } from 'lucide-react';

export default function Page() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/${mod.name}');
      const json = await res.json();
      await new Promise(r => setTimeout(r, 1000));
      setData(json);
    } catch(e) {} finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="page-container fade-in">
      {loading && (
        <div className="global-loader-overlay">
          <div className="loader-content">
            <img src="/icone.png" alt="Loading" className="loader-logo" />
            <div className="dots-container"><div className="dot"></div><div className="dot"></div><div className="dot"></div></div>
          </div>
        </div>
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title text-gradient">${mod.title}</h1>
          <p className="page-subtitle">${mod.subtitle}</p>
        </div>
        <button className="btn-primary"><Plus size={18} /> Novo Registro</button>
      </div>

      <div className="table-container glass-panel">
        <table className="data-table">
          <thead>
            <tr>${mod.cols.map(c => `<th>${c}</th>`).join('')}</tr>
          </thead>
          <tbody>
            {data.map(item => (
              <tr key={item.id}>
                ${mod.cols.map((_, i) => `<td>{Object.values(item)[${i}]}</td>`).join('')}
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && data.length === 0 && <div className="empty-state">Nenhum dado encontrado.</div>}
      </div>
      <style jsx>{\`
        .page-container { padding: 40px; height: 100%; display: flex; flex-direction: column; gap: 24px; overflow-y: auto; }
        .page-header { display: flex; justify-content: space-between; align-items: flex-end; }
        .page-title { font-family: var(--font-outfit); font-size: 32px; font-weight: 800; margin-bottom: 8px; }
        .page-subtitle { color: var(--text-secondary); font-size: 14px; }
        .btn-primary { display: flex; align-items: center; gap: 8px; background: var(--brand-primary); color: #fff; padding: 12px 24px; border-radius: 12px; font-weight: 600; cursor:pointer;}
        .table-container { flex: 1; overflow: hidden; display: flex; flex-direction: column; background: var(--bg-card); border-radius: 16px; border: 1px solid var(--border-glass);}
        .data-table { width: 100%; border-collapse: collapse; text-align: left; color: var(--text-primary); }
        .data-table th, .data-table td { padding: 16px 24px; border-bottom: 1px solid var(--border-glass); }
        .data-table th { font-size: 12px; text-transform: uppercase; color: var(--text-muted); background: rgba(0,0,0,0.1); }
        .empty-state { padding: 60px; text-align: center; color: var(--text-muted); font-size: 16px; }
        .fade-in { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      \`}</style>
    </div>
  );
}`;
  fs.writeFileSync(path.join(dirPath, 'page.js'), pageContent);

  // API
  const apiContent = `import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request) {
  try {
    const { rows } = await pool.query('SELECT * FROM ${mod.table} ORDER BY id DESC LIMIT 50');
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar' }, { status: 500 });
  }
}`;
  fs.writeFileSync(path.join(apiPath, 'route.js'), apiContent);
});

console.log("Pages and APIs generated.");
