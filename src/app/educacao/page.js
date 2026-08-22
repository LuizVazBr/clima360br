"use client";
import { useState, useEffect } from 'react';
import { BookOpen, Plus, Save, X, Trash2 } from 'lucide-react';

export default function EducacaoPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ escola: '', pontuacao: '', medalha: '' });
  
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/educacao');
      const json = await res.json();
      setData(Array.isArray(json) ? json : []);
    } catch(e) {
      setData([]);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async () => {
    await fetch('/api/educacao', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    setIsModalOpen(false);
    fetchData();
  };

  const handleDelete = async (id) => {
    if(confirm("Remover esta escola do ranking?")) {
      await fetch(`/api/educacao/${id}`, { method: 'DELETE' });
      fetchData();
    }
  };

  const getMedalClass = (medal) => {
    if(!medal) return '';
    if(medal.toLowerCase() === 'ouro') return 'medal-gold';
    if(medal.toLowerCase() === 'prata') return 'medal-silver';
    if(medal.toLowerCase() === 'bronze') return 'medal-bronze';
    return '';
  };

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title text-gradient">Educação Ambiental</h1>
          <p className="page-subtitle">Gamificação e Engajamento nas Escolas</p>
        </div>
        <button className="btn-primary" onClick={() => { setFormData({escola: '', pontuacao: '', medalha: ''}); setIsModalOpen(true); }}><Plus size={18} /> Nova Escola</button>
      </div>

      <div className="layout-grid">
        {/* Painel Esquerdo: Simulador Cidadão */}
        <div className="citizen-simulator glass-panel">
          <div className="simulator-header">
            <h3>App do Cidadão (Simulador)</h3>
          </div>
          <div className="smartphone-frame">
            <div className="phone-notch"></div>
            <div className="phone-screen">
              
              <div className="app-header">
                <div className="user-info">
                  <div className="avatar">AM</div>
                  <span>Olá, Aluno(a)</span>
                </div>
                <div className="eco-balance">
                  <span className="balance-label">Clima-Points</span>
                  <span className="balance-value">3.450 pts</span>
                </div>
              </div>

              <div className="app-body">
                <div className="qr-scan-card">
                  <div className="qr-placeholder">
                    {/* Fake QR pattern */}
                    <div className="qr-square"></div>
                    <div className="qr-square" style={{top: 10, right: 10}}></div>
                    <div className="qr-square" style={{bottom: 10, left: 10}}></div>
                  </div>
                  <p>Escaneie a lixeira inteligente da escola para ganhar pontos.</p>
                  <button className="btn-app-primary">Escanear QR Code</button>
                </div>

                <div className="app-actions">
                  <div className="action-card">
                    <BookOpen size={24} color="#10B981" />
                    <span>Como Separar</span>
                  </div>
                  <div className="action-card">
                    <span className="game-icon">🎮</span>
                    <span>Eco-Quiz</span>
                  </div>
                </div>

                <div className="leaderboard-preview">
                  <h4>Ranking da Escola</h4>
                  <div className="rank-item"><span>1. João P.</span> <span>420 pts</span></div>
                  <div className="rank-item"><span>2. Maria C.</span> <span>390 pts</span></div>
                  <div className="rank-item you"><span>3. Você</span> <span>345 pts</span></div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Painel Direito: Ranking das Escolas */}
        <div className="table-container glass-panel">
          <div className="panel-header">
            <h3>Ranking Municipal de Escolas</h3>
          </div>
          {loading && <div className="inline-loader">Carregando ranking...</div>}
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr><th>Ranking</th><th>Escola / Instituição</th><th>Pontuação</th><th>Medalha</th><th>Ações</th></tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr key={item.id}>
                    <td>#{index + 1}</td>
                    <td className="bold">{item.escola}</td>
                    <td className="text-blue">{item.pontuacao} pts</td>
                    <td><span className={`badge-medal ${getMedalClass(item.medalha)}`}>{item.medalha}</span></td>
                    <td><button className="btn-icon delete" onClick={() => handleDelete(item.id)}><Trash2 size={16}/></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!loading && data.length === 0 && <div className="empty-state">Nenhuma escola cadastrada no ranking municipal.</div>}
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content glass-panel" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Cadastrar Nova Escola</h2>
              <button className="btn-close" onClick={() => setIsModalOpen(false)}><X size={20}/></button>
            </div>
            <div className="modal-body">
              <div className="input-group">
                <label>Nome da Escola</label>
                <input value={formData.escola} onChange={e => setFormData({...formData, escola: e.target.value})} placeholder="Ex: E.M. Machado de Assis"/>
              </div>
              <div className="input-group">
                <label>Pontuação Inicial (Clima-Points)</label>
                <input type="number" value={formData.pontuacao} onChange={e => setFormData({...formData, pontuacao: e.target.value})} placeholder="Ex: 1500"/>
              </div>
              <div className="input-group">
                <label>Medalha Atual</label>
                <select value={formData.medalha} onChange={e => setFormData({...formData, medalha: e.target.value})}>
                  <option value="">Nenhuma</option>
                  <option value="Bronze">Bronze</option>
                  <option value="Prata">Prata</option>
                  <option value="Ouro">Ouro</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleSave} disabled={!formData.escola}><Save size={16}/> Salvar no Ranking</button>
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
        
        .layout-grid { display: grid; grid-template-columns: 350px 1fr; gap: 24px; flex: 1; min-height: 0; }
        
        /* Simulador Mobile */
        .citizen-simulator { display: flex; flex-direction: column; overflow: hidden; }
        .simulator-header { padding: 16px 24px; border-bottom: 1px solid var(--border-glass); }
        .simulator-header h3 { margin: 0; font-size: 16px; color: var(--text-primary); }
        
        .smartphone-frame {
          margin: 24px auto;
          width: 280px; height: 550px;
          border: 8px solid #1f2937;
          border-radius: 36px;
          position: relative;
          background: #f9fafb;
          overflow: hidden;
          box-shadow: 0 10px 25px rgba(0,0,0,0.5);
        }
        :global(body.light-mode) .smartphone-frame { border-color: #d1d5db; }
        
        .phone-notch {
          position: absolute; top: 0; left: 50%; transform: translateX(-50%);
          width: 120px; height: 24px; background: #1f2937;
          border-bottom-left-radius: 12px; border-bottom-right-radius: 12px; z-index: 10;
        }
        :global(body.light-mode) .phone-notch { background: #d1d5db; }
        
        .phone-screen { height: 100%; display: flex; flex-direction: column; font-family: sans-serif; }
        
        .app-header { background: #10B981; padding: 40px 16px 20px; display: flex; justify-content: space-between; align-items: center; color: white; }
        .user-info { display: flex; align-items: center; gap: 8px; font-weight: bold; font-size: 14px; }
        .avatar { width: 32px; height: 32px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; }
        .eco-balance { display: flex; flex-direction: column; align-items: flex-end; }
        .balance-label { font-size: 10px; opacity: 0.8; text-transform: uppercase; }
        .balance-value { font-size: 16px; font-weight: 800; }
        
        .app-body { padding: 16px; flex: 1; display: flex; flex-direction: column; gap: 16px; background: #f3f4f6; color: #1f2937; overflow-y: auto;}
        
        .qr-scan-card { background: white; padding: 16px; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); text-align: center; }
        .qr-placeholder { width: 120px; height: 120px; margin: 0 auto 12px; border: 2px dashed #10B981; border-radius: 12px; position: relative; background: #ecfdf5; display: flex; align-items: center; justify-content: center; }
        .qr-square { position: absolute; width: 24px; height: 24px; border: 4px solid #10B981; top: 10px; left: 10px; border-radius: 4px;}
        .qr-scan-card p { font-size: 12px; color: #6b7280; margin-bottom: 12px; line-height: 1.4; }
        .btn-app-primary { background: #10B981; color: white; width: 100%; padding: 12px; border-radius: 8px; font-weight: bold; font-size: 14px; border: none; cursor: pointer; }
        
        .app-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .action-card { background: white; padding: 16px 8px; border-radius: 12px; display: flex; flex-direction: column; align-items: center; gap: 8px; font-size: 12px; font-weight: 600; box-shadow: 0 2px 8px rgba(0,0,0,0.05); cursor: pointer; }
        .game-icon { font-size: 24px; }
        
        .leaderboard-preview { background: white; padding: 16px; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); margin-bottom: 20px;}
        .leaderboard-preview h4 { margin: 0 0 12px 0; font-size: 13px; color: #374151; }
        .rank-item { display: flex; justify-content: space-between; font-size: 12px; padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
        .rank-item:last-child { border-bottom: none; }
        .rank-item.you { font-weight: bold; color: #10B981; }

        /* Estilos da Tabela */
        .table-container { flex: 1; display: flex; flex-direction: column; overflow: hidden; background: var(--bg-card); border-radius: 16px; border: 1px solid var(--border-glass);}
        .panel-header { padding: 24px; border-bottom: 1px solid var(--border-glass); }
        .panel-header h3 { margin: 0; font-size: 18px; color: var(--text-primary); }
        .table-scroll { flex: 1; overflow-y: auto; }
        
        .data-table { width: 100%; border-collapse: collapse; text-align: left; color: var(--text-primary); }
        .data-table th, .data-table td { padding: 16px 24px; border-bottom: 1px solid var(--border-glass); }
        .data-table th { font-size: 12px; text-transform: uppercase; color: var(--text-muted); background: rgba(0,0,0,0.1); }
        .text-blue { color: #3B82F6; font-weight: bold; }
        .bold { font-weight: bold; }
        
        .badge-medal { padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase; }
        .medal-gold { background: rgba(245, 158, 11, 0.2); color: #F59E0B; border: 1px solid rgba(245, 158, 11, 0.5); }
        .medal-silver { background: rgba(156, 163, 175, 0.2); color: #9CA3AF; border: 1px solid rgba(156, 163, 175, 0.5); }
        .medal-bronze { background: rgba(180, 83, 9, 0.2); color: #B45309; border: 1px solid rgba(180, 83, 9, 0.5); }
        
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