"use client";

import React, { useState, useEffect } from 'react';
import { Key, Play, Code, Check, Terminal, FileJson, AlertCircle, Search, Edit2, X, Plus, ShieldCheck, ShieldAlert, Copy } from 'lucide-react';
import { createPortal } from 'react-dom';

export default function ApiDocsPage() {
  const [tokensList, setTokensList] = useState([]);
  const [searchToken, setSearchToken] = useState('');
  const [apiKeyInput, setApiKeyInput] = useState(''); // Input manual para testar
  
  const [toastMessage, setToastMessage] = useState(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form states
  const [editId, setEditId] = useState(null);
  const [newName, setNewName] = useState('');
  const [newIp, setNewIp] = useState('Todos');
  const [newActive, setNewActive] = useState(true);
  
  // Endpoint states
  const [resFontes, setResFontes] = useState(null);
  const [resOuvidoria, setResOuvidoria] = useState(null);
  const [resEstatisticas, setResEstatisticas] = useState(null);
  
  const [loadingFontes, setLoadingFontes] = useState(false);
  const [loadingOuvidoria, setLoadingOuvidoria] = useState(false);
  const [loadingEstatisticas, setLoadingEstatisticas] = useState(false);

  useEffect(() => {
    fetchTokens();
  }, []);

  const fetchTokens = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tokens');
      const data = await res.json();
      if (!data.error && Array.isArray(data)) {
        setTokensList(data);
        if (data.length > 0) {
          // Pre-fill input for faster testing
          setApiKeyInput(prev => prev ? prev : data[0].token);
        }
      }
    } catch(e) {
      console.error(e);
    }
    setLoading(false);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const openCreateModal = () => {
    setEditId(null);
    setNewName('');
    setNewIp('Todos');
    setNewActive(true);
    setIsSheetOpen(true);
  };

  const openEditModal = (tok) => {
    setEditId(tok.id);
    setNewName(tok.name);
    setNewIp(tok.ip_allowlist);
    setNewActive(tok.active);
    setIsSheetOpen(true);
  };

  const handleSaveToken = async (e) => {
    e.preventDefault();
    const method = editId ? 'PUT' : 'POST';
    const body = { id: editId, name: newName, ip_allowlist: newIp, active: newActive };

    try {
      const res = await fetch('/api/tokens', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        setIsSheetOpen(false);
        showToast(editId ? "Token atualizado com sucesso!" : "Token gerado com segurança!");
        fetchTokens();
      }
    } catch (e) {
      showToast("Ops! Erro ao salvar token.");
    }
  };

  const toggleStatus = async (tok) => {
    try {
      const res = await fetch('/api/tokens', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...tok, active: !tok.active })
      });
      if (res.ok) {
        showToast(!tok.active ? "Token ativado!" : "Token inativado com sucesso.");
        fetchTokens();
      }
    } catch (e) {
      showToast("Ops! Erro ao alterar status.");
    }
  };

  const testEndpoint = async (url, setRes, setLoad) => {
    if (!apiKeyInput.trim()) {
      showToast("Ops! Insira uma chave (token) no campo de teste primeiro.");
      setRes(JSON.stringify({ error: "Permissão negada: Token não fornecido." }, null, 2));
      return;
    }
    
    setLoad(true);
    try {
      // 1. Simula a validação no backend
      const valRes = await fetch('/api/tokens/validate', {
        headers: { 'Authorization': `Bearer ${apiKeyInput.trim()}` }
      });
      const valData = await valRes.json();
      
      if (!valRes.ok) {
        setRes(JSON.stringify(valData, null, 2));
        setLoad(false);
        return;
      }
      
      // 2. Se a chave for válida, puxa os dados de verdade
      const res = await fetch(url);
      let data = await res.json();
      
      if (Array.isArray(data) && data.length > 50) {
        data = {
          _meta: { message: `Mostrando 50 de ${data.length} registros para evitar travamento do navegador.` },
          data: data.slice(0, 50)
        };
      }
      
      setRes(JSON.stringify(data, null, 2));
    } catch (e) {
      setRes(JSON.stringify({ error: e.message }, null, 2));
    }
    setLoad(false);
  };

  const copyToClipboard = (txt) => {
    navigator.clipboard.writeText(txt);
    showToast("Copiado para a área de transferência!");
  };

  const filteredTokens = tokensList.filter(t => 
    t.name.toLowerCase().includes(searchToken.toLowerCase()) || 
    t.token.toLowerCase().includes(searchToken.toLowerCase())
  );

  return (
    <div className="page-wrapper fade-in" style={{ padding: '32px', height: '100%', overflowY: 'auto', background: 'var(--bg-main)', position: 'relative' }}>
      
      {/* Custom Toast */}
      {toastMessage && (
        <div style={{ position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)', background: toastMessage.includes('Ops!') ? '#ef4444' : '#10b981', color: '#fff', padding: '12px 24px', borderRadius: '30px', fontWeight: 'bold', fontSize: '14px', zIndex: 9999, boxShadow: '0 4px 20px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: '8px', animation: 'slideDown 0.3s ease-out' }}>
          <AlertCircle size={18} />
          {toastMessage}
        </div>
      )}

      <div style={{ maxWidth: 1200 }}>
        
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: '32px', fontWeight: '900', color: 'var(--text-primary)', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Terminal size={32} color="#10B981" /> API Clima 360
          </h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '16px' }}>
            Acesso para desenvolvedores e integração de sistemas (REST API).
          </p>
        </div>

        {/* Gerenciamento de Tokens */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: '16px', padding: '24px', marginBottom: '32px', boxShadow: 'var(--shadow-glass)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '20px', color: 'var(--text-primary)', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Key size={20} color="#3b82f6" /> Tokens de acesso
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
                Gerencie as chaves para acesso seguro aos endpoints. Envie-as no cabeçalho <code>Authorization: Bearer &lt;TOKEN&gt;</code>
              </p>
            </div>
            
            <button 
              onClick={openCreateModal}
              style={{ background: 'var(--brand-primary)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Plus size={18} /> Gerar
            </button>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', background: 'var(--input-bg)', border: '1px solid var(--border-glass)', borderRadius: '8px', padding: '8px 16px', marginBottom: '16px' }}>
            <Search size={18} color="var(--text-muted)" style={{ marginRight: 8 }} />
            <input 
              type="text" 
              placeholder="Buscar token por nome ou chave..." 
              value={searchToken}
              onChange={e => setSearchToken(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', width: '100%', fontSize: '14px' }}
            />
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>Carregando tokens...</div>
          ) : filteredTokens.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', border: '1px dashed var(--border-glass)', borderRadius: '8px' }}>
              Nenhum token encontrado. Clique em "Gerar" para criar.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredTokens.map(tok => (
                <div key={tok.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-main)', border: '1px solid var(--border-glass)', padding: '16px', borderRadius: '12px' }}>
                  <div style={{ flex: 1, marginRight: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{tok.name}</span>
                      {tok.active ? (
                        <span style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: '12px' }}><ShieldCheck size={12}/> Ativo</span>
                      ) : (
                        <span style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', color: '#ef4444', background: 'rgba(239,68,68,0.1)', padding: '2px 8px', borderRadius: '12px' }}><ShieldAlert size={12}/> Inativo</span>
                      )}
                    </div>
                    <code style={{ fontSize: '13px', color: 'var(--text-muted)', background: 'var(--input-bg)', padding: '4px 8px', borderRadius: '4px', display: 'inline-block', marginBottom: '6px' }}>
                      {tok.token.substring(0, 15)}••••••••••••••••
                    </code>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>IP Liberado: <strong>{tok.ip_allowlist}</strong></div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button onClick={() => copyToClipboard(tok.token)} style={{ background: 'transparent', border: '1px solid var(--border-glass)', color: 'var(--text-primary)', padding: '6px', borderRadius: '6px', cursor: 'pointer' }} title="Copiar Token">
                      <Copy size={16} />
                    </button>
                    <button onClick={() => toggleStatus(tok)} style={{ background: 'transparent', border: '1px solid var(--border-glass)', color: tok.active ? '#ef4444' : '#10b981', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>
                      {tok.active ? 'Inativar' : 'Ativar'}
                    </button>
                    <button onClick={() => openEditModal(tok)} style={{ background: 'transparent', border: '1px solid var(--border-glass)', color: '#3b82f6', padding: '6px', borderRadius: '6px', cursor: 'pointer' }} title="Editar Token">
                      <Edit2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '16px' }}>
          <h2 style={{ fontSize: '24px', color: 'var(--text-primary)', margin: 0 }}>
            Endpoints disponíveis
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Chave de Acesso:</span>
            <input 
              type="text" 
              placeholder="Cole o token (c360-...)"
              value={apiKeyInput}
              onChange={e => setApiKeyInput(e.target.value)}
              style={{ background: 'var(--input-bg)', border: '1px solid var(--border-glass)', padding: '8px 12px', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '13px', width: '250px', outline: 'none' }}
            />
          </div>
        </div>

        {/* Endpoint 1: Fontes */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <span style={{ background: '#3b82f6', color: '#fff', padding: '4px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>GET</span>
                <code style={{ fontSize: '16px', color: 'var(--text-primary)' }}>/api/fontes</code>
              </div>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>Retorna as fontes de dados oficiais e portais de informação climática.</p>
            </div>
            <button 
              onClick={() => testEndpoint('/api/fontes', setResFontes, setLoadingFontes)}
              style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid #3b82f6', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }}
            >
              <Play size={16} /> Testar endpoint
            </button>
          </div>
          
          {loadingFontes && <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Aguardando resposta...</div>}
          {resFontes && !loadingFontes && (
            <div style={{ background: '#1e1e1e', borderRadius: '8px', padding: '16px', overflowX: 'auto', border: '1px solid #333' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', marginBottom: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                <Check size={14} /> 200 OK
              </div>
              <pre style={{ margin: 0, color: '#d4d4d4', fontSize: '13px', fontFamily: 'monospace' }}>
                {resFontes}
              </pre>
            </div>
          )}
        </div>

        {/* Endpoint 2: Ouvidoria */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <span style={{ background: '#3b82f6', color: '#fff', padding: '4px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>GET</span>
                <code style={{ fontSize: '16px', color: 'var(--text-primary)' }}>/api/ouvidoria</code>
              </div>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>Lista as ocorrências climáticas cadastradas pela sociedade (Queimadas, Inundações, etc).</p>
            </div>
            <button 
              onClick={() => testEndpoint('/api/ouvidoria', setResOuvidoria, setLoadingOuvidoria)}
              style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid #3b82f6', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }}
            >
              <Play size={16} /> Testar endpoint
            </button>
          </div>
          
          {loadingOuvidoria && <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Aguardando resposta...</div>}
          {resOuvidoria && !loadingOuvidoria && (
            <div style={{ background: '#1e1e1e', borderRadius: '8px', padding: '16px', overflowX: 'auto', border: '1px solid #333' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', marginBottom: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                <Check size={14} /> 200 OK
              </div>
              <pre style={{ margin: 0, color: '#d4d4d4', fontSize: '13px', fontFamily: 'monospace' }}>
                {resOuvidoria}
              </pre>
            </div>
          )}
        </div>

        {/* Endpoint 3: Estatisticas */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <span style={{ background: '#3b82f6', color: '#fff', padding: '4px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>GET</span>
                <code style={{ fontSize: '16px', color: 'var(--text-primary)' }}>/api/estatisticas-df</code>
              </div>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>Retorna as pontuações e métricas do Painel ClimaBrasil.</p>
            </div>
            <button 
              onClick={() => testEndpoint('/api/estatisticas-df', setResEstatisticas, setLoadingEstatisticas)}
              style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid #3b82f6', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }}
            >
              <Play size={16} /> Testar endpoint
            </button>
          </div>
          
          {loadingEstatisticas && <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Aguardando resposta...</div>}
          {resEstatisticas && !loadingEstatisticas && (
            <div style={{ background: '#1e1e1e', borderRadius: '8px', padding: '16px', overflowX: 'auto', border: '1px solid #333', maxHeight: '400px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', marginBottom: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                <Check size={14} /> 200 OK
              </div>
              <pre style={{ margin: 0, color: '#d4d4d4', fontSize: '13px', fontFamily: 'monospace' }}>
                {resEstatisticas}
              </pre>
            </div>
          )}
        </div>

      </div>

      {/* Bottom Sheet Modal para Cadastro / Edição de Token */}
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
            <div style={{ maxWidth: 600, margin: '0 auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '24px' }}>{editId ? 'Editar token' : 'Gerar token'}</h2>
                <button onClick={() => setIsSheetOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSaveToken} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '14px' }}>Nome da aplicação ou usuário</label>
                  <input 
                    type="text" required value={newName} onChange={e => setNewName(e.target.value)}
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-glass)', background: 'var(--input-bg)', color: 'var(--text-primary)' }}
                    placeholder="Ex: Integração Defesa Civil"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '14px' }}>IP permitido (Ex: 192.168.0.1 ou 'Todos')</label>
                  <input 
                    type="text" required value={newIp} onChange={e => setNewIp(e.target.value)}
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-glass)', background: 'var(--input-bg)', color: 'var(--text-primary)' }}
                    placeholder="Todos"
                  />
                </div>
                
                <button type="submit" style={{
                  marginTop: '16px', padding: '14px', borderRadius: '8px', background: 'var(--brand-primary)',
                  color: '#fff', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '16px'
                }}>
                  {editId ? 'Salvar' : 'Gerar'}
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
