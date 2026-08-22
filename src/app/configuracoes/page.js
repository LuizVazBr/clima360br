"use client";

import { useState, useEffect } from 'react';
import { Save, Upload, FileText, Activity, MapPin, Key } from 'lucide-react';
import { useRole } from '@/hooks/useRole';

export default function ConfiguracoesPage() {
  const [role] = useRole();
  const [lat, setLat] = useState('-15.7938');
  const [lng, setLng] = useState('-47.8828');
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState([]);
  const [keys, setKeys] = useState({ openai: '', claude: '', gemini: '' });

  useEffect(() => {
    fetch('/api/configuracoes')
      .then(res => res.json())
      .then(data => {
        if(data) {
          setLat(data.lat);
          setLng(data.lng);
        }
      });
      
    fetchHistory();

    const savedKeys = localStorage.getItem('clima360_keys');
    if (savedKeys) {
      try {
        setKeys(JSON.parse(savedKeys));
      } catch (e) {}
    }
  }, []);

  const fetchHistory = () => {
    fetch('/api/upload-csv/history')
      .then(r => r.json())
      .then(data => {
        if(Array.isArray(data)) setHistory(data);
      }).catch(e => console.error(e));
  }

  const saveConfig = async () => {
    setMessage('Salvando coordenadas...');
    try {
      const res = await fetch('/api/configuracoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lng })
      });
      if(res.ok) setMessage('Coordenadas iniciais do mapa salvas com sucesso!');
      else setMessage('Erro ao salvar coordenadas.');
    } catch(e) {
      setMessage('Erro na requisição.');
    }
  };

  const handleUpload = async (e, type) => {
    const file = e.target.files[0];
    if(!file) return;
    
    setMessage(`Enviando ${type}... aguarde o processamento.`);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    try {
      const res = await fetch('/api/upload-csv', {
        method: 'POST',
        body: formData
      });
      const result = await res.json();
      if(res.ok) {
        setMessage(`Sucesso! ${result.total} registros processados. Variação: ${result.diff_msg}`);
        fetchHistory(); // refresh history
      } else {
        setMessage(`Erro: ${result.error}`);
      }
    } catch(e) {
      setMessage('Erro de conexão ao enviar arquivo.');
    }
    
    e.target.value = ''; // clear input
  };

  if(role !== 'gestor') {
    return (
      <div style={{ padding: 40, color: '#fff', textAlign: 'center' }}>
        <h2>Acesso Negado</h2>
        <p>Apenas o Gestor Público pode acessar as configurações.</p>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto', overflowX: 'hidden', width: '100%' }}>
      <div style={{ padding: '40px', color: 'var(--text-primary)', maxWidth: '900px' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '24px' }}>Configurações do Sistema</h1>
      
      {message && (
        <div style={{ padding: '16px', background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6', border: '1px solid #3B82F6', borderRadius: '8px', marginBottom: '24px' }}>
          {message}
        </div>
      )}

      {/* MAPA COORDS */}
      <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-glass)', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MapPin size={20} /> Localização Inicial do Mapa
        </h2>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '8px', color: 'var(--text-secondary)' }}>Latitude</label>
            <input 
              type="text" 
              value={lat} 
              onChange={e => setLat(e.target.value)}
              style={{ width: '100%', padding: '10px 16px', background: 'var(--input-bg)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: '#fff' }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '8px', color: 'var(--text-secondary)' }}>Longitude</label>
            <input 
              type="text" 
              value={lng} 
              onChange={e => setLng(e.target.value)}
              style={{ width: '100%', padding: '10px 16px', background: 'var(--input-bg)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: '#fff' }}
            />
          </div>
          <button 
            onClick={saveConfig}
            style={{ padding: '10px 24px', background: '#3B82F6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}
          >
            <Save size={16} /> Salvar Coordenadas
          </button>
        </div>
      </div>

      {/* API KEYS */}
      <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-glass)', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#8B5CF6' }}>
          <Key size={20} color="#8B5CF6" /> Chaves de API (IA)
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', alignItems: 'flex-end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '8px', color: 'var(--text-secondary)' }}>OpenAI (ChatGPT)</label>
            <input 
              type="password" 
              placeholder="sk-..."
              value={keys.openai} 
              onChange={e => setKeys({...keys, openai: e.target.value})}
              style={{ width: '100%', padding: '10px 16px', background: 'var(--input-bg)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: '#fff' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '8px', color: 'var(--text-secondary)' }}>Anthropic (Claude)</label>
            <input 
              type="password"
              placeholder="sk-ant-..." 
              value={keys.claude} 
              onChange={e => setKeys({...keys, claude: e.target.value})}
              style={{ width: '100%', padding: '10px 16px', background: 'var(--input-bg)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: '#fff' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '12px', marginBottom: '8px', color: 'var(--text-secondary)' }}>Google (Gemini)</label>
              <input 
                type="password"
                placeholder="AIza..." 
                value={keys.gemini} 
                onChange={e => setKeys({...keys, gemini: e.target.value})}
                style={{ width: '100%', padding: '10px 16px', background: 'var(--input-bg)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: '#fff' }}
              />
            </div>
            <button 
              onClick={() => {
                localStorage.setItem('clima360_keys', JSON.stringify(keys));
                setMessage('Chaves salvas localmente com sucesso!');
                setTimeout(() => setMessage(''), 3000);
              }}
              style={{ padding: '10px 16px', background: '#8B5CF6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', alignSelf: 'flex-end', height: '40px' }}
            >
              <Save size={16} /> Salvar
            </button>
          </div>
        </div>
      </div>

      {/* UPLOADS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
        
        {[
          { type: 'painel-clima', label: 'Painel Clima Brasil', color: '#10B981', desc: 'Governança, Políticas e Financiamento (axis_name, entity_name, score_value...)' },
          { type: 'ouvidoria', label: 'Ouvidoria e Riscos', color: '#EF4444', desc: 'Ocorrências climáticas georeferenciadas (lat, lng, assunto_nome, bairro, status...)' }
        ].map(({ type, label, color, desc }) => {
          const last = history.find(h => h.upload_type === type);
          return (
            <div key={type} style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '12px', border: `1px solid ${color}30` }}>
              <h2 style={{ fontSize: '18px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', color }}>
                <Upload size={20} color={color} /> {label}
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>{desc}</p>

              {last ? (
                <div style={{ background: 'rgba(0,0,0,0.15)', padding: '12px', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <FileText size={32} color={color} />
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '13px' }}>{last.file_name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{last.total_records} registros · {new Date(last.upload_date).toLocaleString('pt-BR')}</div>
                    <div style={{ fontSize: '11px', color, marginTop: '4px' }}>{last.metrics?.diff_msg || ''}</div>
                  </div>
                </div>
              ) : (
                <div style={{ background: 'rgba(0,0,0,0.1)', padding: '12px', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FileText size={28} color="var(--text-muted)" />
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Nenhum arquivo carregado ainda.</span>
                </div>
              )}

              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: `rgba(${color === '#10B981' ? '16,185,129' : '239,68,68'},0.1)`, color, border: `1px solid ${color}50`, borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                <Upload size={14} /> {last ? 'Substituir CSV' : 'Carregar CSV'}
                <input type="file" accept=".csv" style={{ display: 'none' }} onChange={(e) => handleUpload(e, type)} />
              </label>
            </div>
          );
        })}
      </div>

      {/* HISTORICO */}
      <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={20} /> Histórico de Atualizações
        </h2>
        {history.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>Nenhum upload registrado recentemente.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: 'var(--input-bg)', textAlign: 'left' }}>
                <th style={{ padding: '12px', color: 'var(--text-secondary)' }}>Data</th>
                <th style={{ padding: '12px', color: 'var(--text-secondary)' }}>Tipo</th>
                <th style={{ padding: '12px', color: 'var(--text-secondary)' }}>Arquivo</th>
                <th style={{ padding: '12px', color: 'var(--text-secondary)' }}>Registros</th>
                <th style={{ padding: '12px', color: 'var(--text-secondary)' }}>Variação / Impacto</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                  <td style={{ padding: '12px' }}>{new Date(h.upload_date).toLocaleString('pt-BR')}</td>
                  <td style={{ padding: '12px', fontWeight: 'bold', color: h.upload_type === 'ouvidoria' ? '#EF4444' : '#10B981' }}>{h.upload_type.toUpperCase()}</td>
                  <td style={{ padding: '12px' }}>{h.file_name}</td>
                  <td style={{ padding: '12px' }}>{h.total_records} un</td>
                  <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{h.metrics?.diff_msg || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      </div>
    </div>
  );
}
