"use client";

import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, X, RefreshCw } from 'lucide-react';

export default function CadastroPage() {
  const [cooperativas, setCooperativas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Form/Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: null, nome: '', endereco: '', status: 'Regularizado', tipo: 'Cooperativa' });
  const [isSaving, setIsSaving] = useState(false);

  const getBadgeClass = (status) => {
    if (!status) return '';
    const s = status.toLowerCase();
    if (s === 'regularizado' || s === 'ativa') return 'regularizado';
    if (s === 'pendente' || s === 'em análise') return 'pendente';
    if (s === 'bloqueado' || s === 'inativa') return 'bloqueado';
    return s.replace(' ', '-');
  };

  // Fetch data
  const fetchCooperativas = async (search = "") => {
    setLoading(true);
    try {
      const url = search ? `/api/cooperativas?search=${encodeURIComponent(search)}` : '/api/cooperativas';
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      // Delay artificial para exibir a bela animação de loading 
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setCooperativas(data);
    } catch (err) {
      console.error(err);
      alert('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCooperativas();
  }, []);

  // Handle Search
  const handleSearch = (e) => {
    e.preventDefault();
    fetchCooperativas(searchTerm);
  };

  // Open Modal (Create or Edit)
  const openModal = (coop = null) => {
    if (coop) {
      setFormData({ id: coop.id, nome: coop.nome, endereco: coop.endereco, status: coop.status });
    } else {
      setFormData({ id: null, nome: '', endereco: '', status: 'Ativa' });
    }
    setIsModalOpen(true);
  };

  // Close Modal
  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ id: null, nome: '', endereco: '', status: 'Ativa' });
  };

  // Save (Create/Update)
  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const method = formData.id ? 'PUT' : 'POST';
      const url = formData.id ? `/api/cooperativas/${formData.id}` : '/api/cooperativas';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: formData.nome,
          endereco: formData.endereco,
          status: formData.status
        })
      });
      
      if (!res.ok) throw new Error('Erro ao salvar');
      
      closeModal();
      fetchCooperativas(searchTerm); // reload list
    } catch (err) {
      console.error(err);
      alert('Falha ao salvar o registro.');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete
  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este registro?')) return;
    
    try {
      const res = await fetch(`/api/cooperativas/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erro ao excluir');
      fetchCooperativas(searchTerm);
    } catch (err) {
      console.error(err);
      alert('Falha ao excluir o registro.');
    }
  };

  return (
    <div className="page-container fade-in">
      
      {/* Overlay de Loading Independente da estrutura da página */}
      {loading && (
        <div className="global-loader-overlay">
          <div className="loader-content">
            <img src="/icone.png" alt="Carregando..." className="loader-logo" />
            <div className="dots-container">
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </div>
          </div>
        </div>
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title text-gradient">Cadastros e Formalização</h1>
          <p className="page-subtitle">Gestão de Cooperativas e Geradores de Resíduos</p>
        </div>
        
        <button className="btn-primary" onClick={() => openModal()}>
          <Plus size={18} /> Novo Cadastro
        </button>
      </div>

      {/* Toolbar: Busca e Filtros */}
      <div className="toolbar glass-panel">
        <form onSubmit={handleSearch} className="search-box">
          <Search size={20} className="search-icon" />
          <input 
            type="text" 
            placeholder="Buscar por nome ou endereço..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="btn-search">Buscar</button>
        </form>
        
        <button className="btn-refresh" onClick={() => {setSearchTerm(""); fetchCooperativas("");}} title="Recarregar">
          <RefreshCw size={20} />
        </button>
      </div>

      {/* Tabela de Dados */}
      <div className="table-container glass-panel">
        {loading ? (
          <div className="loading-placeholder">
            {/* O conteúdo da tabela fica invisível enquanto o overlay carrega */}
          </div>
        ) : cooperativas.length === 0 ? (
          <div className="empty-state">Nenhum registro encontrado.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Nome / Razão Social</th>
                <th>Tipo</th>
                <th>Status</th>
                <th>Certificação ESG</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {cooperativas.map(p => (
                <tr key={p.id}>
                  <td className="bold-text">{p.nome}</td>
                  <td>{p.tipo}</td>
                  <td>
                    <span className={`status-badge ${getBadgeClass(p.status)}`}>
                      {p.status}
                    </span>
                  </td>
                  <td>
                    {p.tipo === 'Cooperativa' && <span className="esg-badge gold">🏆 Selo Ouro</span>}
                    {p.tipo === 'Gerador' && <span className="esg-badge certified">🌿 Certificado</span>}
                    {p.tipo === 'Reciclador' && <span className="esg-badge silver">🥈 Selo Prata</span>}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="action-icon-btn edit" onClick={() => openModal(p)} title="Editar">
                      <Edit2 size={16} />
                    </button>
                    <button className="action-icon-btn delete" onClick={() => handleDelete(p.id)} title="Excluir">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel bounce-in">
            <div className="modal-header">
              <h2>{formData.id ? 'Editar Cadastro' : 'Novo Cadastro'}</h2>
              <button className="close-modal-btn" onClick={closeModal}><X size={24} /></button>
            </div>
            <form onSubmit={handleSave} className="modal-form">
              <div className="form-group">
                <label>Nome da Organização</label>
                <input type="text" required value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Tipo</label>
                <select value={formData.tipo} onChange={e => setFormData({...formData, tipo: e.target.value})}>
                  <option value="Cooperativa">Cooperativa</option>
                  <option value="Gerador">Gerador</option>
                  <option value="Reciclador">Reciclador</option>
                </select>
              </div>
              <div className="form-group">
                <label>Status Operacional</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                  <option value="Regularizado">Regularizado</option>
                  <option value="Pendente">Pendente</option>
                  <option value="Bloqueado">Bloqueado</option>
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={closeModal}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={isSaving}>
                  {isSaving ? 'Salvando...' : 'Salvar Registro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .page-container { padding: 40px; height: 100%; display: flex; flex-direction: column; gap: 24px; }
        .page-header { display: flex; justify-content: space-between; align-items: flex-end; }
        .page-title { font-size: 32px; font-weight: 800; }
        .btn-primary { display: flex; align-items: center; gap: 8px; background: var(--brand-primary); color: #fff; padding: 12px 24px; border-radius: 12px; }
        .toolbar { padding: 16px 24px; display: flex; gap: 16px; align-items: center; }
        .search-box { flex: 1; display: flex; align-items: center; background: rgba(0,0,0,0.2); border: 1px solid var(--border-glass); border-radius: 12px; padding: 4px 4px 4px 16px; }
        .search-box input { flex: 1; background: transparent; border: none; padding: 12px; outline: none; }
        .btn-refresh { width: 48px; height: 48px; border-radius: 12px; background: rgba(255,255,255,0.05); }
        .data-table { width: 100%; border-collapse: collapse; }
        .data-table th, .data-table td { padding: 16px 24px; border-bottom: 1px solid var(--border-glass); text-align: left; }
        .bold-text { font-weight: 600; }
        .status-badge { display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
        .status-badge.regularizado { background: rgba(16,185,129,0.15); color: #10B981; }
        .status-badge.pendente { background: rgba(245,158,11,0.15); color: #F59E0B; }
        .status-badge.bloqueado { background: rgba(239,68,68,0.15); color: #EF4444; }
        .esg-badge { padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; background: rgba(255,255,255,0.05); border: 1px solid var(--border-glass); display: inline-flex; align-items: center; gap: 4px; }
        .esg-badge.gold { border-color: #F59E0B; color: #F59E0B; }
        .esg-badge.silver { border-color: #9CA3AF; color: #9CA3AF; }
        .esg-badge.certified { border-color: #10B981; color: #10B981; }
        .modal-overlay { position: fixed; inset: 0; background: var(--overlay-bg); backdrop-filter: blur(8px); z-index: 10000; display: flex; align-items: center; justify-content: center; }
        .modal-content { width: 100%; max-width: 500px; background: var(--bg-main); padding: 32px; }
        .modal-form { display: flex; flex-direction: column; gap: 20px; }
        .form-group { display: flex; flex-direction: column; gap: 8px; }
        .form-group input, .form-group select { background: var(--input-bg); border: 1px solid var(--border-glass); padding: 14px; border-radius: 12px; }
        .modal-footer { display: flex; justify-content: flex-end; gap: 16px; margin-top: 16px; padding-top: 24px; border-top: 1px solid var(--border-glass); }
        .action-icon-btn { width: 32px; height: 32px; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; margin-left: 8px; transition: 0.2s; }
        .action-icon-btn.edit { background: rgba(59, 130, 246, 0.1); color: #3B82F6; }
        .action-icon-btn.edit:hover { background: rgba(59, 130, 246, 0.2); }
        .action-icon-btn.delete { background: rgba(239, 68, 68, 0.1); color: #EF4444; }
        .action-icon-btn.delete:hover { background: rgba(239, 68, 68, 0.2); }

        .loading-state, .empty-state {
          padding: 60px;
          text-align: center;
          color: var(--text-muted);
          font-size: 16px;
        }

        /* MODAL */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: var(--overlay-bg);
          backdrop-filter: blur(8px);
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .modal-content {
          width: 100%;
          max-width: 500px;
          background: var(--bg-main);
          padding: 32px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .modal-header h2 { font-family: var(--font-outfit); font-size: 24px; }

        .close-modal-btn {
          background: rgba(255,255,255,0.05);
          color: var(--text-secondary);
          width: 36px; height: 36px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          transition: 0.2s;
        }
        .close-modal-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }

        .modal-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .form-group label {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .form-group input, .form-group select {
          background: var(--input-bg);
          border: 1px solid var(--border-glass);
          color: var(--text-primary);
          padding: 14px 16px;
          border-radius: 12px;
          font-size: 15px;
          outline: none;
          transition: 0.2s;
        }

        .form-group input:focus, .form-group select:focus {
          border-color: var(--brand-primary);
          box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 16px;
          margin-top: 16px;
          padding-top: 24px;
          border-top: 1px solid var(--border-glass);
        }

        .fade-in { animation: fadeIn 0.4s ease-out; }
        .bounce-in { animation: bounceIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes bounceIn {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }

        /* Estilos do Loading (Overlay) */
        .global-loader-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(8px);
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        :global(body.light-mode) .global-loader-overlay {
          background: rgba(255, 255, 255, 0.8);
        }

        .loader-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
        }

        .loader-logo {
          width: 80px;
          height: 80px;
          object-fit: contain;
          animation: pulseLogo 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        .dots-container {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: var(--brand-primary);
          animation: bounceDot 1.4s infinite ease-in-out both;
        }

        .dot:nth-child(1) { animation-delay: -0.32s; }
        .dot:nth-child(2) { animation-delay: -0.16s; }

        @keyframes pulseLogo {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.95); }
        }

        @keyframes bounceDot {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
