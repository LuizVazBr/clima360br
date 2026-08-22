"use client";

import React, { useState, useEffect } from 'react';
import { Database, Link as LinkIcon, Calendar, CheckCircle, Search, X, Plus, Edit2, Info } from 'lucide-react';
import { createPortal } from 'react-dom';

export default function FontesPage() {
  const [activeTab, setActiveTab] = useState('api');
  const [searchTerm, setSearchTerm] = useState('');
  const [modalUrl, setModalUrl] = useState(null);
  const [fontes, setFontes] = useState([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form states
  const [editId, setEditId] = useState(null);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newLink, setNewLink] = useState('');
  const [newKeywords, setNewKeywords] = useState('');

  const fetchFontes = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/fontes');
      const data = await res.json();
      
      const defaultData = [
        { id: 'def1', name: 'INPE - BDQueimadas', description: 'Monitoramento oficial de focos de queimadas e incêndios florestais.', urls: '["https://terrabrasilis.dpi.inpe.br/queimadas/bdqueimadas/"]', created_at: new Date().toISOString(), type: 'api' },
        { id: 'def2', name: 'CEMADEN', description: 'Centro Nacional de Monitoramento e Alertas de Desastres Naturais.', urls: '["https://www.cemaden.gov.br/"]', created_at: new Date().toISOString(), type: 'api' },
        { id: 'def3', name: 'SISDIA', description: 'Sistema Distrital de Informações Ambientais (Áreas de Risco / Defesa Civil)', urls: '["https://sisdia.df.gov.br/home/dados-e-informacoes/"]', created_at: new Date().toISOString(), type: 'api' }
      ];

      if (data.error || !Array.isArray(data) || data.length === 0) {
        setFontes(defaultData);
      } else {
        // Some old entries might not have 'type', assume 'api'
        let sanitized = data.map(d => ({ ...d, type: d.type || 'api' }));
        
        // Custom sort: Adapta Brasil MCTI first, then alphabetical
        sanitized.sort((a, b) => {
          if (a.name.toUpperCase().includes('ADAPTA BRASIL')) return -1;
          if (b.name.toUpperCase().includes('ADAPTA BRASIL')) return 1;
          return a.name.localeCompare(b.name);
        });

        setFontes(sanitized);
      }
    } catch (e) {
      console.error(e);
      setFontes([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFontes();
  }, []);

  const openCreateModal = () => {
    setEditId(null);
    setNewName('');
    setNewDesc('');
    setNewLink('');
    setNewKeywords('');
    setIsSheetOpen(true);
  };

  const openEditModal = (fonte) => {
    setEditId(fonte.id);
    setNewName(fonte.name);
    setNewDesc(fonte.description);
    
    let parsedLinks = [];
    if (Array.isArray(fonte.urls)) {
      parsedLinks = fonte.urls;
    } else if (typeof fonte.urls === 'string') {
      try { parsedLinks = JSON.parse(fonte.urls); } catch(e) { parsedLinks = [fonte.urls]; }
    }
    setNewLink(parsedLinks.join('\\n'));
    setNewKeywords(fonte.keywords || '');
    
    setIsSheetOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const method = editId ? 'PUT' : 'POST';
    const linksArray = newLink.split('\\n').map(l => l.trim()).filter(l => l.length > 0);
    const body = {
      id: editId,
      name: newName,
      desc: newDesc,
      links: linksArray.length > 0 ? linksArray : [newLink],
      type: activeTab,
      keywords: newKeywords
    };

    try {
      const res = await fetch('/api/fontes', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        setIsSheetOpen(false);
        fetchFontes();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredFontes = fontes.filter(f => 
    f.type === activeTab &&
    (f.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    f.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.keywords?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="page-wrapper fade-in" style={{ padding: '32px', height: '100%', overflowY: 'auto', background: 'var(--bg-main)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)', margin: '0 0 8px 0' }}>Fontes de Dados</h1>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Gerenciamento de integrações, APIs e Fontes de Informação</p>
          </div>
          
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--input-bg)', border: '1px solid var(--border-glass)', borderRadius: '8px', padding: '8px 16px', width: 300 }}>
              <Search size={18} color="var(--text-muted)" style={{ marginRight: 8 }} />
              <input 
                type="text" 
                placeholder="Buscar fontes..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', width: '100%', fontSize: '14px' }}
              />
            </div>
            
            <button 
              onClick={openCreateModal}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: 'var(--brand-primary)', color: '#fff',
                border: 'none', padding: '10px 20px', borderRadius: '8px',
                fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)'
              }}
            >
              <Plus size={18} /> Cadastrar
            </button>
          </div>
        </div>

        {/* TABS */}
        <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '16px', marginBottom: '32px' }}>
          <button 
            onClick={() => setActiveTab('api')}
            style={{ 
              background: activeTab === 'api' ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
              border: activeTab === 'api' ? '1px solid #3b82f6' : '1px solid transparent',
              color: activeTab === 'api' ? '#3b82f6' : 'var(--text-secondary)',
              padding: '8px 16px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s'
            }}
          >
            <Database size={16} /> APIs e Dados
          </button>
          <button 
            onClick={() => setActiveTab('info')}
            style={{ 
              background: activeTab === 'info' ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
              border: activeTab === 'info' ? '1px solid #ef4444' : '1px solid transparent',
              color: activeTab === 'info' ? '#ef4444' : 'var(--text-secondary)',
              padding: '8px 16px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s'
            }}
          >
            <Info size={16} /> Informações e Portais
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '64px', color: 'var(--text-muted)' }}>Carregando fontes...</div>
        ) : filteredFontes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px', background: 'var(--bg-card)', borderRadius: '16px', border: '1px dashed var(--border-glass)' }}>
            Nenhuma fonte encontrada nesta aba.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
            {filteredFontes.map(fonte => {
              let linksArray = [];
              if (Array.isArray(fonte.urls)) {
                linksArray = fonte.urls;
              } else if (typeof fonte.urls === 'string') {
                try { linksArray = JSON.parse(fonte.urls); } catch(e) { linksArray = [fonte.urls]; }
              }
              
              return (
                <div key={fonte.id} style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border-glass)',
                  borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px',
                  boxShadow: 'var(--shadow-glass)', position: 'relative'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: 40, height: 40, borderRadius: '10px', background: activeTab === 'api' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: activeTab === 'api' ? '#3b82f6' : '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {activeTab === 'api' ? <Database size={20} /> : <Info size={20} />}
                      </div>
                      <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{fonte.name}</h3>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--brand-primary)', padding: '4px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle size={12} /> Ativo
                      </div>
                      <button onClick={() => openEditModal(fonte)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}>
                        <Edit2 size={16} />
                      </button>
                    </div>
                  </div>

                  <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                    {fonte.description}
                  </p>

                  {fonte.keywords && (
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      <strong>Palavras-chave:</strong> {fonte.keywords}
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-glass)' }}>
                    {linksArray.map((link, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => setModalUrl(link)}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--brand-primary)', cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                      >
                        <LinkIcon size={14} />
                        <span>{link}</span>
                      </div>
                    ))}
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
                      <Calendar size={14} />
                      <span>Cadastrado em: {new Date(fonte.created_at).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Modal Iframe com Proxy */}
      {modalUrl && createPortal(
        <div style={{
          position: 'fixed',
          top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.8)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }} onClick={() => setModalUrl(null)}>
          <div style={{
            width: '90%', height: '90%',
            background: '#fff',
            borderRadius: '12px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '12px 24px', background: 'var(--bg-card)', borderBottom: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-primary)', fontWeight: 'bold', fontSize: '14px' }}>Visualizando: {modalUrl}</span>
              <div style={{ display: 'flex', gap: '16px' }}>
                <button onClick={() => window.open(modalUrl, '_blank')} style={{ background: 'var(--brand-primary)', padding: '4px 12px', borderRadius: '4px', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '12px' }}>
                  Abrir Original
                </button>
                <button onClick={() => setModalUrl(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>
            </div>
            {/* Usa a nossa rota de proxy apenas para sites que bloqueiam iframe */}
            <iframe 
              src={(modalUrl.includes('mapbiomas.org') || modalUrl.includes('nasa.gov') || modalUrl.includes('inpe.br')) ? modalUrl : `/api/iframe-proxy?url=${encodeURIComponent(modalUrl)}`} 
              style={{ width: '100%', height: '100%', border: 'none' }} 
              title="Preview" 
            />
          </div>
        </div>,
        document.body
      )}

      {/* Bottom Sheet Modal para Cadastro / Edição */}
      {isSheetOpen && createPortal(
        <>
          <div 
            style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', zIndex: 99998 }}
            onClick={() => setIsSheetOpen(false)}
          />
          <div style={{
            position: 'fixed',
            bottom: 0, left: 0, width: '100%',
            background: 'var(--bg-main)',
            borderTopLeftRadius: '24px',
            borderTopRightRadius: '24px',
            padding: '32px',
            zIndex: 99999,
            boxShadow: '0 -10px 40px rgba(0,0,0,0.3)',
            animation: 'slideUp 0.3s ease-out'
          }}>
            <div style={{ maxWidth: 800, margin: '0 auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '24px' }}>{editId ? 'Editar Fonte' : 'Nova Fonte'} de {activeTab === 'api' ? 'Dados/API' : 'Informação'}</h2>
                <button onClick={() => setIsSheetOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '14px' }}>Nome da Fonte</label>
                  <input 
                    type="text" required value={newName} onChange={e => setNewName(e.target.value)}
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-glass)', background: 'var(--input-bg)', color: 'var(--text-primary)' }}
                    placeholder="Ex: SEMA DF"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '14px' }}>Descrição</label>
                  <input 
                    type="text" required value={newDesc} onChange={e => setNewDesc(e.target.value)}
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-glass)', background: 'var(--input-bg)', color: 'var(--text-primary)' }}
                    placeholder="Descrição da finalidade dos dados ou do portal..."
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '14px' }}>URLs (Uma por linha)</label>
                  <textarea 
                    required value={newLink} onChange={e => setNewLink(e.target.value)}
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-glass)', background: 'var(--input-bg)', color: 'var(--text-primary)', minHeight: '80px', fontFamily: 'monospace' }}
                    placeholder="https://..."
                  />
                </div>

                {activeTab === 'info' && (
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '14px' }}>Palavras-chave (Notícias, Ofícios, Leis)</label>
                    <input 
                      type="text" value={newKeywords} onChange={e => setNewKeywords(e.target.value)}
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-glass)', background: 'var(--input-bg)', color: 'var(--text-primary)' }}
                      placeholder="Ex: meio ambiente, ofícios, desmatamento..."
                    />
                  </div>
                )}
                
                <button type="submit" style={{
                  marginTop: '16px', padding: '14px', borderRadius: '8px', background: 'var(--brand-primary)',
                  color: '#fff', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '16px'
                }}>
                  {editId ? 'Salvar Alterações' : 'Cadastrar Fonte'}
                </button>
              </form>
            </div>
          </div>
          <style jsx>{`
            @keyframes slideUp {
              from { transform: translateY(100%); }
              to { transform: translateY(0); }
            }
          `}</style>
        </>,
        document.body
      )}
    </div>
  );
}
