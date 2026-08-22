"use client";
import { useState, useEffect } from 'react';
import { Store, Plus, Save, X, Trash2 } from 'lucide-react';

export default function MarketplacePage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ material: '', toneladas: '', valor_total: '' });
  
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/marketplace');
      const json = await res.json();
      setData(json);
    } catch(e) {} finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async () => {
    await fetch('/api/marketplace', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    setIsModalOpen(false);
    fetchData();
  };

  const handleDelete = async (id) => {
    if(confirm("Cancelar esta venda?")) {
      await fetch(`/api/marketplace/${id}`, { method: 'DELETE' });
      fetchData();
    }
  };

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title text-gradient">Marketplace Circular</h1>
          <p className="page-subtitle">Venda de Recicláveis e Créditos de Logística Reversa</p>
        </div>
        <button className="btn-primary" onClick={() => { setFormData({material: '', toneladas: '', valor_total: ''}); setIsModalOpen(true); }}><Plus size={18} /> Nova Venda</button>
      </div>

      {/* NOVO DASHBOARD IOT */}
      <div className="iot-dashboard glass-panel fade-in">
        <div className="iot-header">
          <div className="iot-title">
            <span className="live-dot"></span>
            <h3>Lotes Identificados por IA (Câmeras IoT)</h3>
          </div>
          <span className="iot-subtitle">Ofertas automatizadas prontas para negociação</span>
        </div>
        
        <div className="iot-cards">
          <div className="iot-card">
            <div className="card-top">
              <span className="source-name">📍 Supermercado Y (Gerador)</span>
              <span className="time-ago">Detectado há 10 min</span>
            </div>
            <div className="detected-materials">
              <div className="mat-tag pet">PET (Fardos) <br/><b>~ 1.2 Ton</b></div>
              <div className="mat-tag papel">Papelão <br/><b>~ 2.5 Ton</b></div>
            </div>
            <div className="card-actions">
              <div className="estimated-value">Valor Estimado: <br/><b>R$ 6.100,00</b></div>
              <button className="btn-publish" onClick={() => { setFormData({material: 'Papelão e PET (Misto)', toneladas: '3.7', valor_total: '6100.00'}); setIsModalOpen(true); }}>
                Publicar no Marketplace
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="table-container glass-panel">
        {loading && <div className="inline-loader">Carregando dados...</div>}
        <table className="data-table">
          <thead>
            <tr><th>ID Lote</th><th>Material</th><th>Volume (Ton)</th><th>Valor Transação</th><th>Status</th><th>Ação</th></tr>
          </thead>
          <tbody>
            {data.map(item => (
              <tr key={item.id}>
                <td>#{item.id}</td>
                <td className="bold">{item.material}</td>
                <td>{item.toneladas} t</td>
                <td className="text-green">R$ {item.valor_total}</td>
                <td><span className="badge-vendido">Vendido</span></td>
                <td><button className="btn-icon delete" onClick={() => handleDelete(item.id)}><Trash2 size={16}/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && data.length === 0 && <div className="empty-state">Nenhuma transação no marketplace.</div>}
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content glass-panel" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Nova Venda (Lote)</h2>
              <button className="btn-close" onClick={() => setIsModalOpen(false)}><X size={20}/></button>
            </div>
            <div className="modal-body">
              <div className="input-group">
                <label>Tipo de Material</label>
                <select value={formData.material} onChange={e => setFormData({...formData, material: e.target.value})}>
                  <option value="">Selecione...</option>
                  <option value="PET">PET (Fardos)</option>
                  <option value="Papelão">Papelão Ondulado</option>
                  <option value="Vidro">Vidro (Cacos)</option>
                  <option value="Alumínio">Alumínio (Latinhas)</option>
                </select>
              </div>
              <div className="input-group">
                <label>Volume (Toneladas)</label>
                <input type="number" step="0.1" value={formData.toneladas} onChange={e => setFormData({...formData, toneladas: e.target.value})} placeholder="Ex: 2.5"/>
              </div>
              <div className="input-group">
                <label>Valor Total (R$)</label>
                <input type="number" step="0.01" value={formData.valor_total} onChange={e => setFormData({...formData, valor_total: e.target.value})} placeholder="Ex: 4500.00"/>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleSave} disabled={!formData.material || !formData.toneladas}><Save size={16}/> Confirmar Venda</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .page-container { padding: 40px; height: 100%; display: flex; flex-direction: column; gap: 24px; overflow-y: auto; }
        .page-header { display: flex; justify-content: space-between; align-items: flex-end; }
        .page-title { font-family: var(--font-outfit); font-size: 32px; font-weight: 800; margin-bottom: 8px; }
        .page-subtitle { color: var(--text-secondary); font-size: 14px; }
        
        .btn-primary { display: flex; align-items: center; gap: 8px; background: var(--brand-primary); color: #fff; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor:pointer; border: none; }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-secondary { background: transparent; color: var(--text-secondary); padding: 10px 20px; border: 1px solid var(--border-glass); border-radius: 8px; cursor: pointer; }
        
        /* IOT DASHBOARD */
        .iot-dashboard { margin-bottom: 24px; border-radius: 16px; background: var(--bg-card); border: 1px solid rgba(59, 130, 246, 0.3); overflow: hidden; }
        .iot-header { padding: 16px 24px; background: rgba(59, 130, 246, 0.05); border-bottom: 1px solid var(--border-glass); display: flex; justify-content: space-between; align-items: center; }
        .iot-title { display: flex; align-items: center; gap: 12px; }
        .iot-title h3 { margin: 0; font-size: 16px; color: var(--text-primary); }
        .live-dot { width: 10px; height: 10px; background: #EF4444; border-radius: 50%; box-shadow: 0 0 8px #EF4444; animation: pulse 1.5s infinite; }
        .iot-subtitle { font-size: 12px; color: var(--text-secondary); }
        
        .iot-cards { padding: 24px; display: flex; gap: 24px; }
        .iot-card { flex: 1; background: rgba(255,255,255,0.02); border: 1px solid var(--border-glass); border-radius: 12px; padding: 20px; display: flex; flex-direction: column; gap: 16px; }
        .card-top { display: flex; justify-content: space-between; align-items: center; font-size: 12px; }
        .source-name { font-weight: bold; color: var(--text-primary); }
        .time-ago { color: var(--text-muted); }
        
        .detected-materials { display: flex; gap: 12px; }
        .mat-tag { flex: 1; padding: 12px; border-radius: 8px; font-size: 12px; text-align: center; border: 1px solid; }
        .mat-tag.pet { background: rgba(16, 185, 129, 0.1); border-color: rgba(16, 185, 129, 0.3); color: #10B981; }
        .mat-tag.papel { background: rgba(245, 158, 11, 0.1); border-color: rgba(245, 158, 11, 0.3); color: #F59E0B; }
        .mat-tag b { font-size: 16px; display: block; margin-top: 4px; }
        
        .card-actions { display: flex; justify-content: space-between; align-items: center; padding-top: 16px; border-top: 1px dashed var(--border-glass); }
        .estimated-value { font-size: 12px; color: var(--text-secondary); }
        .estimated-value b { font-size: 18px; color: var(--text-primary); }
        .btn-publish { background: #3B82F6; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: 0.2s; }
        .btn-publish:hover { background: #2563EB; }
        @keyframes pulse { 0% { transform: scale(0.95); opacity: 0.5; } 50% { transform: scale(1); opacity: 1; } 100% { transform: scale(0.95); opacity: 0.5; } }

        .table-container { flex: 1; overflow: auto; background: var(--bg-card); border-radius: 16px; border: 1px solid var(--border-glass);}
        .data-table { width: 100%; border-collapse: collapse; text-align: left; color: var(--text-primary); }
        .data-table th, .data-table td { padding: 16px 24px; border-bottom: 1px solid var(--border-glass); }
        .data-table th { font-size: 12px; text-transform: uppercase; color: var(--text-muted); background: rgba(0,0,0,0.1); }
        .text-green { color: var(--brand-primary); font-weight: bold; }
        .bold { font-weight: bold; }
        
        .badge-vendido { padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; background: rgba(16, 185, 129, 0.15); color: #10B981; }
        
        .btn-icon { background: transparent; border: none; cursor: pointer; padding: 6px; border-radius: 6px; transition: 0.2s; }
        .btn-icon.delete { color: #EF4444; }
        .btn-icon.delete:hover { background: rgba(239, 68, 68, 0.1); }
        
        .inline-loader { padding: 16px; text-align: center; color: var(--brand-primary); font-size: 13px; font-weight: 600; }
        .empty-state { padding: 60px; text-align: center; color: var(--text-muted); font-size: 16px; }
        
        .modal-overlay { position: fixed; inset: 0; background: var(--overlay-bg); backdrop-filter: blur(4px); z-index: 9999; display: flex; align-items: center; justify-content: center; }
        .modal-content { width: 400px; padding: 24px; background: var(--bg-main); border-radius: 16px; border: 1px solid var(--border-glass); }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .modal-header h2 { font-size: 18px; color: var(--text-primary); margin: 0; }
        .btn-close { background: transparent; border: none; color: var(--text-secondary); cursor: pointer; }
        
        .input-group { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
        .input-group label { font-size: 12px; color: var(--text-secondary); font-weight: 600; text-transform: uppercase; }
        .input-group input, .input-group select { padding: 10px 14px; border-radius: 8px; border: 1px solid var(--border-glass); background: var(--input-bg); color: var(--text-primary); outline: none; }
        .input-group input:focus, .input-group select:focus { border-color: var(--brand-primary); }
        .input-group select option { background: #0B0C10; }
        
        .modal-footer { display: flex; justify-content: flex-end; gap: 12px; margin-top: 32px; }
        .fade-in { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}