"use client";
import { useState, useEffect } from 'react';
import { Users, Plus, Edit2, Trash2, X, Save, TrendingUp, Award, Droplet, Package } from 'lucide-react';

export default function CatadorPage() {
  const [catadores, setCatadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: null, nome: '', cpf: '', renda_mensal: '' });

  const fetchCatadores = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/catadores');
      const data = await res.json();
      setCatadores(data);
    } catch(e) {} finally { setLoading(false); }
  };

  useEffect(() => { fetchCatadores(); }, []);

  const openModal = (catador = null) => {
    if(catador) {
      setFormData({ id: catador.id, nome: catador.nome, cpf: catador.cpf, renda_mensal: catador.renda_mensal });
    } else {
      setFormData({ id: null, nome: '', cpf: '', renda_mensal: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    const method = formData.id ? 'PUT' : 'POST';
    const url = formData.id ? `/api/catadores/${formData.id}` : '/api/catadores';
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    setIsModalOpen(false);
    fetchCatadores();
  };

  const handleDelete = async (id) => {
    if(confirm("Excluir este catador?")) {
      await fetch(`/api/catadores/${id}`, { method: 'DELETE' });
      fetchCatadores();
    }
  };

  // KPIs dinâmicos
  const totalCatadores = catadores.length;
  const rendaMedia = catadores.length > 0 
    ? (catadores.reduce((acc, curr) => acc + parseFloat(curr.renda_mensal || 0), 0) / catadores.length).toFixed(2)
    : 0;

  // Mock de especialidades puramente visual
  const getSpecialty = (id) => {
    const specs = [
      { text: 'Especialista PET', color: '#10B981', icon: <Droplet size={12}/> },
      { text: 'Papel e Papelão', color: '#F59E0B', icon: <Package size={12}/> },
      { text: 'Coleta Mista', color: '#3B82F6', icon: <Users size={12}/> }
    ];
    return specs[id % specs.length];
  };

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title text-gradient">Catador 4.0</h1>
          <p className="page-subtitle">Plataforma de Inclusão, Formalização e Geração de Renda</p>
        </div>
        <button className="btn-primary" onClick={() => openModal()}><Plus size={18} /> Novo Talento</button>
      </div>

      {/* KPIs DASHBOARD */}
      <div className="kpi-dashboard">
        <div className="kpi-card glass-panel">
          <div className="kpi-icon blue"><Users size={20}/></div>
          <div className="kpi-info">
            <span className="kpi-label">Catadores Ativos</span>
            <span className="kpi-value">{totalCatadores}</span>
          </div>
        </div>
        <div className="kpi-card glass-panel">
          <div className="kpi-icon green"><TrendingUp size={20}/></div>
          <div className="kpi-info">
            <span className="kpi-label">Renda Média Mensal</span>
            <span className="kpi-value">R$ {rendaMedia}</span>
          </div>
        </div>
        <div className="kpi-card glass-panel">
          <div className="kpi-icon gold"><Award size={20}/></div>
          <div className="kpi-info">
            <span className="kpi-label">Impacto de Inclusão</span>
            <span className="kpi-value">Selo Prata</span>
          </div>
        </div>
      </div>

      <div className="cards-grid">
        {loading && <div className="inline-loader">Carregando talentos...</div>}
        
        {catadores.map(c => {
          const spec = getSpecialty(c.id);
          // Barra visual de ganhos (Mock)
          const fillPercent = Math.min((parseFloat(c.renda_mensal) / 4000) * 100, 100);
          
          return (
            <div className="catador-card glass-panel" key={c.id}>
              
              <div className="card-header">
                <div className="avatar-wrapper">
                  <div className="avatar">{c.nome.substring(0, 2).toUpperCase()}</div>
                  <span className={`status-dot ${c.status === 'Ativo' ? 'online' : 'offline'}`}></span>
                </div>
                <div className="actions">
                  <button className="btn-icon edit" onClick={() => openModal(c)}><Edit2 size={16}/></button>
                  <button className="btn-icon delete" onClick={() => handleDelete(c.id)}><Trash2 size={16}/></button>
                </div>
              </div>

              <div className="card-body">
                <h3>{c.nome}</h3>
                <span className="cpf">CPF: {c.cpf}</span>
                
                <div className="specialty-tag" style={{ background: spec.color + '22', color: spec.color, border: `1px solid ${spec.color}55` }}>
                  {spec.icon} {spec.text}
                </div>
              </div>

              <div className="card-footer">
                <div className="income-header">
                  <span>Renda Mensal Estimada</span>
                  <span className="income-val">R$ {c.renda_mensal}</span>
                </div>
                <div className="progress-bar-bg">
                  <div className="progress-fill" style={{ width: `${fillPercent}%`, background: spec.color }}></div>
                </div>
              </div>

            </div>
          );
        })}
        
        {!loading && catadores.length === 0 && <div className="empty-state">Nenhum catador cadastrado na plataforma.</div>}
      </div>

      {/* MODAL DE CADASTRO */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content glass-panel" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{formData.id ? 'Editar Perfil' : 'Cadastrar Novo Talento'}</h2>
              <button className="btn-close" onClick={() => setIsModalOpen(false)}><X size={20}/></button>
            </div>
            <div className="modal-body">
              <div className="input-group">
                <label>Nome Completo</label>
                <input value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} placeholder="Ex: João da Silva"/>
              </div>
              <div className="input-group">
                <label>CPF</label>
                <input value={formData.cpf} onChange={e => setFormData({...formData, cpf: e.target.value})} placeholder="000.000.000-00"/>
              </div>
              <div className="input-group">
                <label>Renda Mensal Base (R$)</label>
                <input type="number" value={formData.renda_mensal} onChange={e => setFormData({...formData, renda_mensal: e.target.value})} placeholder="1500.00"/>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleSave}><Save size={16}/> Salvar Perfil</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .page-container { padding: 40px; height: 100%; display: flex; flex-direction: column; gap: 24px; overflow-y: auto; }
        .page-header { display: flex; justify-content: space-between; align-items: flex-end; }
        .page-title { font-family: var(--font-outfit); font-size: 32px; font-weight: 800; margin-bottom: 8px; }
        .page-subtitle { color: var(--text-secondary); font-size: 14px; }
        
        .btn-primary { display: flex; align-items: center; gap: 8px; background: var(--brand-primary); color: #fff; padding: 12px 24px; border-radius: 12px; font-weight: 600; cursor:pointer; border: none; transition: 0.2s; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4);}
        .btn-primary:hover { transform: translateY(-2px); filter: brightness(1.1); }
        .btn-secondary { background: transparent; color: var(--text-secondary); padding: 10px 20px; border: 1px solid var(--border-glass); border-radius: 8px; cursor: pointer; }
        
        /* KPIs */
        .kpi-dashboard { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .kpi-card { display: flex; align-items: center; gap: 16px; padding: 20px 24px; border-radius: 16px; background: var(--bg-card); border: 1px solid var(--border-glass); }
        .kpi-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; }
        .kpi-icon.blue { background: linear-gradient(135deg, #3B82F6, #2563EB); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); }
        .kpi-icon.green { background: linear-gradient(135deg, #10B981, #059669); box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3); }
        .kpi-icon.gold { background: linear-gradient(135deg, #F59E0B, #D97706); box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3); }
        .kpi-info { display: flex; flex-direction: column; }
        .kpi-label { font-size: 12px; color: var(--text-secondary); text-transform: uppercase; font-weight: 600; margin-bottom: 4px;}
        .kpi-value { font-size: 24px; font-weight: 800; color: var(--text-primary); font-family: var(--font-outfit);}

        /* GRID DE CARTÕES */
        .cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; }
        
        .catador-card { 
          background: var(--bg-card); border: 1px solid var(--border-glass); 
          border-radius: 20px; padding: 24px; display: flex; flex-direction: column; gap: 16px;
          transition: 0.3s;
        }
        .catador-card:hover { transform: translateY(-5px); box-shadow: var(--shadow-glass); border-color: var(--border-focus); }
        
        .card-header { display: flex; justify-content: space-between; align-items: flex-start; }
        .avatar-wrapper { position: relative; }
        .avatar { width: 56px; height: 56px; border-radius: 50%; background: rgba(255,255,255,0.05); border: 2px solid var(--border-glass); display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 800; color: var(--text-primary); }
        .status-dot { position: absolute; bottom: 2px; right: 2px; width: 14px; height: 14px; border-radius: 50%; border: 2px solid var(--bg-card); }
        .status-dot.online { background: #10B981; }
        .status-dot.offline { background: #6B7280; }
        
        .actions { display: flex; gap: 4px; }
        .btn-icon { background: rgba(255,255,255,0.02); border: 1px solid var(--border-glass); color: var(--text-secondary); cursor: pointer; padding: 6px; border-radius: 8px; transition: 0.2s; }
        .btn-icon:hover { background: rgba(255,255,255,0.1); color: var(--text-primary); }
        .btn-icon.delete:hover { background: rgba(239, 68, 68, 0.1); color: #EF4444; border-color: rgba(239, 68, 68, 0.3); }
        
        .card-body h3 { margin: 0 0 4px 0; font-size: 18px; color: var(--text-primary); }
        .cpf { font-size: 13px; color: var(--text-secondary); display: block; margin-bottom: 16px; }
        .specialty-tag { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
        
        .card-footer { padding-top: 16px; border-top: 1px dashed var(--border-glass); }
        .income-header { display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: var(--text-secondary); margin-bottom: 8px; }
        .income-val { font-weight: 800; color: var(--text-primary); font-size: 14px; }
        .progress-bar-bg { width: 100%; height: 6px; background: rgba(0,0,0,0.2); border-radius: 10px; overflow: hidden; }
        :global(body.light-mode) .progress-bar-bg { background: rgba(0,0,0,0.05); }
        .progress-fill { height: 100%; border-radius: 10px; transition: width 1s ease-out; }
        
        .inline-loader { grid-column: 1 / -1; padding: 16px; text-align: center; color: var(--brand-primary); font-size: 13px; font-weight: 600; }
        .empty-state { grid-column: 1 / -1; padding: 60px; text-align: center; color: var(--text-muted); font-size: 16px; }
        .fade-in { animation: fadeIn 0.4s ease-out; }

        .modal-overlay { position: fixed; inset: 0; background: var(--overlay-bg); backdrop-filter: blur(8px); z-index: 10000; display: flex; align-items: center; justify-content: center; }
        .modal-content { width: 100%; max-width: 450px; padding: 32px; background: var(--bg-main); border-radius: 24px; border: 1px solid var(--border-glass); box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .modal-header h2 { font-size: 20px; color: var(--text-primary); margin: 0; font-family: var(--font-outfit); }
        .btn-close { background: transparent; border: none; color: var(--text-secondary); cursor: pointer; transition: 0.2s; }
        .btn-close:hover { color: var(--text-primary); }
        
        .input-group { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
        .input-group label { font-size: 12px; color: var(--text-secondary); font-weight: 600; text-transform: uppercase; }
        .input-group input { padding: 14px 16px; border-radius: 12px; border: 1px solid var(--border-glass); background: var(--input-bg); color: var(--text-primary); outline: none; font-size: 15px; }
        .input-group input:focus { border-color: var(--brand-primary); }
        
        .modal-footer { display: flex; justify-content: flex-end; gap: 12px; margin-top: 32px; padding-top: 24px; border-top: 1px solid var(--border-glass);}
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}
