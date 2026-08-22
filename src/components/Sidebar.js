"use client";

import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { useLang } from '@/contexts/LangContext';

export default function Sidebar() {
  const { t, lang } = useLang();
  const [activeTab, setActiveTab] = useState('timeline');
  const [role, setRole] = useState('gestor');
  
  // Real Data states
  const [dfStats, setDfStats] = useState([]);
  const [loadingStats, setLoadingStats] = useState(false);
  
  const [ouvidoriaFeed, setOuvidoriaFeed] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingFeed, setLoadingFeed] = useState(false);

  const [co2Data, setCo2Data] = useState([]);

  useEffect(() => {
    const savedRole = localStorage.getItem('virdia-role');
    if (savedRole) setRole(savedRole);
    
    // Fetch DF stats
    setLoadingStats(true);
    fetch('/api/estatisticas-df')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setDfStats(data);
        setLoadingStats(false);
      })
      .catch(e => {
        console.error(e);
        setLoadingStats(false);
      });
  }, []);

  useEffect(() => {
    fetchCo2();
  }, []);

  useEffect(() => {
    fetchOuvidoria(page);
  }, [page]);

  const fetchCo2 = async () => {
    try {
      const res = await fetch('/api/co2');
      const data = await res.json();
      if(Array.isArray(data)) setCo2Data(data);
    } catch(e) {
      console.error('Erro CO2', e);
    }
  };

  const fetchOuvidoria = async (pageNumber) => {
    setLoadingFeed(true);
    try {
      const res = await fetch(`/api/ouvidoria?page=${pageNumber}&limit=4`);
      const data = await res.json();
      if(Array.isArray(data)) {
        if(data.length === 0) {
          setHasMore(false);
        } else {
          setOuvidoriaFeed(prev => [...prev, ...data]);
        }
      }
    } catch(e) {
      console.error(e);
    }
    setLoadingFeed(false);
  };

  const handleScroll = (e) => {
    const bottom = e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight + 10;
    if (bottom && hasMore && !loadingFeed) {
      setPage(prev => prev + 1);
    }
  };

  return (
    <aside className="sidebar">
      {/* TABS ESTILO PORTVISION */}
      <div className="tabs-container">
        <button 
          className={`tab-btn ${activeTab === 'timeline' ? 'active' : ''}`}
          onClick={() => setActiveTab('timeline')}
        >
          {role === 'gestor' ? t('sidebarTimeline') : t('sidebarAlerts')}
        </button>
        <button 
          className={`tab-btn ${activeTab === 'estatisticas' ? 'active' : ''}`}
          onClick={() => setActiveTab('estatisticas')}
        >
          {t('sidebarStats')}
        </button>
      </div>

      {activeTab === 'timeline' ? (
        <div className="feed-container" onScroll={handleScroll} style={{ overflowY: 'auto', flex: 1, minHeight: 0 }}>
          <div className="feed-header">
            <span className="feed-title">{role === 'gestor' ? t('feedUpdates') : t('myAlerts')}</span>
            <span className="live-dot"></span>
          </div>

          {role === 'gestor' && (
            <>
              {/* CO2 Index Widget */}
              {co2Data && co2Data.length > 0 && (
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>Índice CO (Qualidade do Ar)</strong>
                    <span style={{ fontSize: '10px', color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '2px 6px', borderRadius: '4px' }}>AO VIVO</span>
                  </div>
                  <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginBottom: '12px' }}>Fonte: Open-Meteo Air Quality API</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
                    {co2Data.slice(0, 3).map(station => (
                      <div key={station.id} style={{ minWidth: '80px', textAlign: 'center', background: 'var(--input-bg)', padding: '8px', borderRadius: '8px' }}>
                        <div style={{ fontSize: '10px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{station.bairro}</div>
                        <div style={{ fontSize: '16px', fontWeight: 'bold', color: station.co2_index > 180 ? '#ef4444' : '#f59e0b' }}>{station.co2_index}</div>
                        <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>μg/m³</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {ouvidoriaFeed.length === 0 && !loadingFeed ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center' }}>Nenhuma ocorrência encontrada.</p>
              ) : (
                ouvidoriaFeed.map((occ, idx) => (
                  <div 
                    className="alert-card danger" 
                    key={`occ-${idx}`} 
                    style={{ marginBottom: '12px', cursor: 'pointer' }}
                    onClick={() => {
                      if(occ.lat && occ.lng) {
                        window.dispatchEvent(new CustomEvent('flyTo', { detail: { lat: occ.lat, lng: occ.lng, openOuvidoria: true } }));
                      }
                    }}
                  >
                    <div className="alert-header">
                      <span className="badge-blue" style={{ background: '#3b82f6' }}>Ouvidoria</span>
                      <span className="alert-id">{occ.protocolo || `OUV-${occ.id}`}</span>
                      <span className="alert-meta" style={{ fontSize: '10px' }}>{occ.data_registro || occ.data_abertura || 'Recente'}</span>
                    </div>
                    <div className="alert-image-placeholder" style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '16px', border: '1px dashed rgba(59,130,246,0.3)', minHeight: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <AlertTriangle size={24} color="#3b82f6" />
                      <span style={{ fontSize: '11px', color: '#3b82f6', marginTop: '8px', fontWeight: 'bold' }}>Registro Fotográfico / Evidência</span>
                    </div>
                    <div className="alert-footer" style={{ padding: '12px', borderTop: '1px solid var(--border-glass)' }}>
                      <strong style={{ display: 'block', marginBottom: '6px', color: 'var(--text-primary)', fontSize: '14px' }}>{occ.assunto_nome}</strong>
                      <div style={{ background: 'var(--bg-main)', padding: '8px 12px', borderRadius: '6px', borderLeft: '3px solid #3b82f6', marginBottom: '8px' }}>
                        <p style={{ margin: '0', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                          <strong>Descrição:</strong> {occ.descricao || 'Sem descrição detalhada.'}
                        </p>
                      </div>
                      <p style={{ margin: '0', fontSize: '11px', fontWeight: 'bold' }}>📍 {occ.bairro || 'DF'}</p>
                    </div>
                  </div>
                ))
              )}
              {loadingFeed && <p style={{ color: 'var(--text-muted)', fontSize: '12px', textAlign: 'center', margin: '8px 0' }}>Carregando ocorrências...</p>}
            </>
          )}

          {role === 'supermercado' && (
            <div className="alert-card info mt-3">
              <div className="alert-header">
                <span className="badge-blue">Coleta</span>
                <span className="alert-id">COL-102</span>
                <span className="alert-meta">10:15:00</span>
              </div>
              <div className="alert-body">
                <Info size={20} color="#3B82F6" />
                <div>
                  <strong>Agendamento Confirmado</strong>
                  <p>O caminhão da Cooperativa B passará hoje às 14h.</p>
                </div>
              </div>
            </div>
          )}

          {role === 'catador' && (
            <div className="alert-card success mt-3">
              <div className="alert-header">
                <span className="badge-blue">Pagamento</span>
                <span className="alert-id">PAG-088</span>
                <span className="alert-meta">Ontem</span>
              </div>
              <div className="alert-body">
                <CheckCircle size={20} color="#10B981" />
                <div>
                  <strong>Repasse Confirmado</strong>
                  <p>Pix de R$ 245,50 referente ao Lote 42 depositado.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="stats-container">
          <div className="feed-header">
            <span className="feed-title">{t('statsTitle')}</span>
          </div>
          <div className="stats-list">
            {role === 'gestor' && (
              <div className="charts-container">
                {loadingStats ? (
                  <p style={{color: 'var(--text-muted)', fontSize: '13px'}}>{t('loading')}</p>
                ) : dfStats.length > 0 ? (
                  dfStats.map((stat, idx) => {
                    let color = '#3B82F6'; // Default (Governança)
                    if (stat.axis.includes('Financiamento')) color = '#F59E0B';
                    if (stat.axis.includes('Políticas')) color = '#10B981';
                    
                    return (
                      <div className="chart-item" key={idx}>
                        <div className="chart-header">
                          <span className="chart-label">{t(stat.axis)}</span>
                          <span className="chart-value" style={{color}}>{stat.percentage}%</span>
                        </div>
                        <div className="progress-bar-container">
                          <div className="progress-bar-fill" style={{width: `${stat.percentage}%`, background: color}}></div>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '20px' }}>Nenhum dado encontrado para o DF.</div>
                )}
              </div>
            )}

            {role === 'tcu' && (
              <div className="charts-container">
                <div className="chart-item">
                  <div className="chart-header">
                    <span className="chart-label">Auditorias em Andamento</span>
                    <span className="chart-value">12</span>
                  </div>
                  <div className="progress-bar-container"><div className="progress-bar-fill" style={{width: '60%', background: '#3B82F6'}}></div></div>
                </div>
                <div className="chart-item">
                  <div className="chart-header">
                    <span className="chart-label">Demandas Concluídas</span>
                    <span className="chart-value text-success">45%</span>
                  </div>
                  <div className="progress-bar-container"><div className="progress-bar-fill" style={{width: '45%', background: '#10B981'}}></div></div>
                </div>
              </div>
            )}

            {role === 'auditor' && (
              <div className="charts-container">
                <div className="chart-item">
                  <div className="chart-header">
                    <span className="chart-label">Inconsistências (IA)</span>
                    <span className="chart-value" style={{color: '#EF4444'}}>8</span>
                  </div>
                  <div className="progress-bar-container"><div className="progress-bar-fill" style={{width: '25%', background: '#EF4444'}}></div></div>
                </div>
                <div className="chart-item">
                  <div className="chart-header">
                    <span className="chart-label">Gastos Validados</span>
                    <span className="chart-value text-success">R$ 2.5M</span>
                  </div>
                  <div className="progress-bar-container"><div className="progress-bar-fill" style={{width: '15%', background: '#10B981'}}></div></div>
                </div>
              </div>
            )}

            {role === 'cidadao' && (
              <div className="charts-container">
                <div className="chart-item">
                  <div className="chart-header">
                    <span className="chart-label">Ocorrências Resolvidas</span>
                    <span className="chart-value text-success">80%</span>
                  </div>
                  <div className="progress-bar-container"><div className="progress-bar-fill" style={{width: '80%', background: '#10B981'}}></div></div>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      <style jsx>{`
        .sidebar {
          width: 320px;
          height: calc(100vh - 64px);
          display: flex;
          flex-direction: column;
          padding: 20px;
          background: var(--bg-card); 
          border-right: 1px solid var(--border-glass);
          z-index: 100;
          flex-shrink: 0;
        }

        .tabs-container {
          display: flex;
          background: var(--input-bg);
          border: 1px solid var(--border-glass);
          border-radius: 30px;
          padding: 4px;
          margin-bottom: 24px;
        }

        .tab-btn {
          flex: 1;
          padding: 8px 0;
          border-radius: 30px;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
          transition: all 0.3s;
          border: none;
          cursor: pointer;
          background: transparent;
        }

        .tab-btn.active {
          background: #3B82F6; 
          color: #fff;
          box-shadow: 0 0 15px rgba(59, 130, 246, 0.4);
        }

        .feed-container {
          display: flex;
          flex-direction: column;
          flex: 1;
          overflow-y: auto;
          padding-right: 4px;
        }
        .feed-container::-webkit-scrollbar { width: 4px; }
        .feed-container::-webkit-scrollbar-thumb { background: var(--text-muted); border-radius: 4px; }

        .feed-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }
        
        .feed-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .live-dot {
          width: 8px;
          height: 8px;
          background: var(--brand-primary);
          border-radius: 50%;
          box-shadow: 0 0 8px var(--brand-primary);
        }

        .alert-card {
          background: var(--bg-card);
          border: 1px solid var(--border-glass);
          border-radius: 12px;
          overflow: hidden;
        }
        .mt-3 { margin-top: 12px; }

        .alert-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          font-size: 11px;
          border-bottom: 1px solid var(--border-glass);
        }

        .badge-blue {
          background: #3B82F6;
          color: #fff;
          padding: 2px 8px;
          border-radius: 4px;
          font-weight: 600;
        }

        .alert-id { color: var(--text-secondary); }
        .alert-meta { margin-left: auto; color: var(--text-muted); }

        .alert-image-placeholder {
          height: 160px;
          background: var(--input-bg);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }

        .alert-image-placeholder p {
          color: #EF4444;
          font-weight: 700;
          font-size: 13px;
          letter-spacing: 1px;
        }

        .alert-footer { padding: 12px; }
        .alert-footer strong { display: block; font-size: 13px; color: var(--text-primary); margin-bottom: 4px; }
        .alert-footer p { font-size: 12px; color: var(--text-secondary); }

        .alert-body {
          display: flex;
          gap: 12px;
          padding: 16px;
          align-items: flex-start;
        }
        .alert-body strong { display: block; font-size: 13px; color: var(--text-primary); margin-bottom: 4px; }
        .alert-body p { font-size: 12px; color: var(--text-secondary); margin: 0; }

        .stats-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .stat-row {
          display: flex;
          justify-content: space-between;
          padding: 16px;
          background: var(--bg-card);
          border-radius: 8px;
          border: 1px solid var(--border-glass);
        }
        .stat-lbl { color: var(--text-secondary); font-size: 13px; }
        .stat-val { color: var(--text-primary); font-weight: bold; font-size: 14px; }
        .text-success { color: var(--brand-primary); }

        .charts-container { display: flex; flex-direction: column; gap: 16px; }
        .chart-item { display: flex; flex-direction: column; gap: 6px; background: var(--bg-card); padding: 16px; border-radius: 8px; border: 1px solid var(--border-glass); }
        .chart-header { display: flex; justify-content: space-between; align-items: center; }
        .chart-label { font-size: 12px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; }
        .chart-value { font-size: 14px; font-weight: bold; color: var(--text-primary); }
        .progress-bar-container { width: 100%; height: 6px; background: rgba(0,0,0,0.2); border-radius: 4px; overflow: hidden; }
        .progress-bar-fill { height: 100%; border-radius: 4px; }
      `}</style>
    </aside>
  );
}
