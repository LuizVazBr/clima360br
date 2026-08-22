"use client";
import { useState, useEffect } from 'react';
import { Truck, Plus, Save, X, Trash2 } from 'lucide-react';

export default function Page() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ gerador: '', volume: '', status: 'Agendado' });
  
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/recuperacao');
      const json = await res.json();
      await new Promise(r => setTimeout(r, 1000));
      setData(json);
    } catch(e) {} finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async () => {
    await fetch('/api/recuperacao', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    setIsModalOpen(false);
    fetchData();
  };

  return (
    <div className="page-container fade-in">
      
      <div className="page-header">
        <div>
          <h1 className="page-title text-gradient">Recuperação Inteligente</h1>
          <p className="page-subtitle">Otimização de Rotas e Coletas</p>
        </div>
        <button className="btn-primary" onClick={() => { setFormData({gerador: '', volume: '', status: 'Agendado'}); setIsModalOpen(true); }}>
          <Plus size={18} /> Novo Registro
        </button>
      </div>

      <div className="table-container glass-panel">
        {loading && <div className="inline-loader">Carregando dados...</div>}
        <table className="data-table">
          <thead>
            <tr><th>ID</th><th>Gerador</th><th>Volume</th><th>Status</th></tr>
          </thead>
          <tbody>
            {data.map(item => (
              <tr key={item.id}>
                <td className="id-col">#{item.id}</td>
                <td className="bold-text">{item.gerador}</td>
                <td className="text-blue">{item.volume}</td>
                <td><span className={`badge-status ${item.status.toLowerCase().replace(' ', '-')}`}>{item.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && data.length === 0 && <div className="empty-state">Nenhum dado encontrado.</div>}
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content glass-panel" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Novo Agendamento de Coleta</h2>
              <button className="btn-close" onClick={() => setIsModalOpen(false)}><X size={20}/></button>
            </div>
            <div className="modal-body">
              <div className="input-group">
                <label>Ponto Gerador</label>
                <input value={formData.gerador} onChange={e => setFormData({...formData, gerador: e.target.value})} placeholder="Ex: Supermercado Central"/>
              </div>
              <div className="input-group">
                <label>Estimativa de Volume</label>
                <input value={formData.volume} onChange={e => setFormData({...formData, volume: e.target.value})} placeholder="Ex: 500 Kg (Papelão)"/>
              </div>
              <div className="input-group">
                <label>Status</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                  <option value="Agendado">Agendado</option>
                  <option value="Em Trânsito">Em Trânsito</option>
                  <option value="Concluído">Concluído</option>
                  <option value="Atrasado">Atrasado</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleSave} disabled={!formData.gerador || !formData.volume}><Save size={16}/> Agendar Rota</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .page-container { padding: 40px; height: 100%; display: flex; flex-direction: column; gap: 24px; overflow-y: auto; }
        .page-header { display: flex; justify-content: space-between; align-items: flex-end; }
        .page-title { font-family: var(--font-outfit); font-size: 32px; font-weight: 800; margin-bottom: 8px; }
        .page-subtitle { color: var(--text-secondary); font-size: 14px; }
        
        .btn-primary { display: flex; align-items: center; gap: 8px; background: var(--brand-primary); color: #fff; padding: 12px 24px; border-radius: 12px; font-weight: 600; cursor:pointer; border: none; }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-secondary { background: transparent; color: var(--text-secondary); padding: 10px 20px; border: 1px solid var(--border-glass); border-radius: 8px; cursor: pointer; }
        
        .table-container { flex: 1; overflow: hidden; display: flex; flex-direction: column; background: var(--bg-card); border-radius: 16px; border: 1px solid var(--border-glass);}
        .data-table { width: 100%; border-collapse: collapse; text-align: left; color: var(--text-primary); }
        .data-table th, .data-table td { padding: 16px 24px; border-bottom: 1px solid var(--border-glass); }
        .data-table th { font-size: 12px; text-transform: uppercase; color: var(--text-muted); background: rgba(0,0,0,0.1); }
        
        .id-col { color: var(--text-muted); font-family: monospace; }
        .bold-text { font-weight: 600; color: var(--text-primary); }
        .text-blue { color: #3B82F6; font-weight: bold; }
        
        .badge-status { padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
        .badge-status.agendado { background: rgba(59, 130, 246, 0.2); color: #3B82F6; }
        .badge-status.em-trânsito { background: rgba(245, 158, 11, 0.2); color: #F59E0B; }
        .badge-status.concluído { background: rgba(16, 185, 129, 0.2); color: #10B981; }
        .badge-status.atrasado { background: rgba(239, 68, 68, 0.2); color: #EF4444; }

        .empty-state { padding: 60px; text-align: center; color: var(--text-muted); font-size: 16px; }
        .fade-in { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .inline-loader { padding: 16px; text-align: center; color: var(--brand-primary); font-size: 13px; font-weight: 600; }
        
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); z-index: 9999; display: flex; align-items: center; justify-content: center; }
        .modal-content { width: 450px; padding: 24px; background: var(--bg-main); border-radius: 16px; border: 1px solid var(--border-glass); }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .modal-header h2 { font-size: 18px; color: var(--text-primary); margin: 0; }
        .btn-close { background: transparent; border: none; color: var(--text-secondary); cursor: pointer; }
        
        .input-group { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
        .input-group label { font-size: 12px; color: var(--text-secondary); font-weight: 600; text-transform: uppercase; }
        .input-group input, .input-group select { padding: 10px 14px; border-radius: 8px; border: 1px solid var(--border-glass); background: rgba(0,0,0,0.1); color: var(--text-primary); outline: none; }
        .input-group input:focus, .input-group select:focus { border-color: var(--brand-primary); }
        .input-group select option { background: #0B0C10; }
        
        .modal-footer { display: flex; justify-content: flex-end; gap: 12px; margin-top: 32px; }
      `}</style>
    </div>
  );
}