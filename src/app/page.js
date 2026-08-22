"use client";

import dynamic from 'next/dynamic';
import { Calendar, Truck, DollarSign, Search, Flame, TrendingUp, Brain, AlertTriangle, Map, BookOpen, Store, ScanEye, Send, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';
import OuvidoriaWidget from '@/components/OuvidoriaWidget';
import { useRole } from '@/hooks/useRole';
import CobrarSimulator from '@/components/CobrarSimulator';
import { useLang } from '@/contexts/LangContext';

const MapClient = dynamic(() => import('@/components/MapClient'), {
  ssr: false,
  loading: () => (
    <div className="global-loader-overlay" style={{position: 'absolute'}}>
      <div className="loader-content">
        <img src="/logo-light.png" alt="Carregando..." className="loader-logo" />
        <div className="dots-container">
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </div>
      </div>
    </div>
  )
});

export default function Home() {
  const { t } = useLang();
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [ouvidoriaOpen, setOuvidoriaOpen] = useState(false);
  const [role] = useRole();
  const [tcuData, setTcuData] = useState({ ouvidoria: [], stats: [] });
  
  // ESG Partners State
  const [esgPartners, setEsgPartners] = useState([
    { name: 'Drogasil', percent: '5%', desc: 'desconto ao cidadão', address: 'SCS Quadra 4, Brasília' },
    { name: 'Bigbox', percent: '3%', desc: 'nas compras', address: 'Águas Claras' },
    { name: 'Laboratório Exame', percent: '10%', desc: 'em exames de sangue', address: 'Asa Sul' },
  ]);
  const [showEsgModal, setShowEsgModal] = useState(false);
  const [newEsgPartner, setNewEsgPartner] = useState({ name: '', percent: '', desc: '', address: '' });
  const [redeemModal, setRedeemModal] = useState({ show: false, partner: null, code: '' });
  
  // Raio-X Simulador State
  const [showSimularDropdown, setShowSimularDropdown] = useState(false);
  const [raioXData, setRaioXData] = useState(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchCenter, setSearchCenter] = useState(null);

  const handleSearch = async (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.length > 2) {
      try {
        const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(val)}&lat=-15.7938&lon=-47.8828&limit=5`);
        const data = await res.json();
        setSearchResults(data.features || []);
      } catch (err) {
        console.error(err);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleSelectResult = (feature) => {
    const [lng, lat] = feature.geometry.coordinates;
    setSearchCenter([lat, lng]);
    setSearchQuery(feature.properties.name);
    setSearchResults([]);
  };

  useEffect(() => {
    const handleFly = (e) => {
      setSearchCenter(null);
      if (e.detail && e.detail.openOuvidoria) {
        setOuvidoriaOpen(true);
      }
    };
    window.addEventListener('flyTo', handleFly);
    return () => window.removeEventListener('flyTo', handleFly);
  }, []);

  // Fetch real TCU/MP data (ouvidoria + DF stats)
  useEffect(() => {
    if (role === 'tcu' || role === 'mp') {
      Promise.all([
        fetch('/api/ouvidoria').then(r => r.json()).catch(() => []),
        fetch('/api/estatisticas-df').then(r => r.json()).catch(() => [])
      ]).then(([ouvidoria, stats]) => {
        setTcuData({
          ouvidoria: Array.isArray(ouvidoria) ? ouvidoria : [],
          stats: Array.isArray(stats) ? stats : []
        });
      });
    }
  }, [role]);

  return (
    <main className="map-wrapper fade-in">
      {role === 'gestor' ? (
        <>
          <div className="map-fullscreen-container">
            <MapClient showHeatmap={showHeatmap} searchCenter={searchCenter} ouvidoriaOpen={ouvidoriaOpen} />
          </div>
          
          {/* Camada Sobreposta HUD */}
          <div className="hud-overlay" style={{ pointerEvents: 'none', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 900 }}>
            
            <div className="hud-header" style={{ display: 'flex', justifyContent: 'flex-end', padding: '20px', pointerEvents: 'auto' }}>
              <div className="map-tools" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <div className="search-box" style={{ position: 'relative' }}>
                  <Search size={16} color="#9CA3AF" />
                  <input 
                    type="text" 
                    placeholder="Buscar região..." 
                    value={searchQuery}
                    onChange={handleSearch}
                  />
                  {searchResults.length > 0 && (
                    <div className="search-results-dropdown" style={{ position: 'absolute', top: '100%', left: 0, width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: '8px', marginTop: '8px', overflow: 'hidden', zIndex: 1000 }}>
                      {searchResults.map((res, i) => (
                        <div key={i} className="search-result-item" onClick={() => handleSelectResult(res)} style={{ padding: '8px 12px', cursor: 'pointer', fontSize: '13px', borderBottom: i < searchResults.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <MapPin size={14} color="#9ca3af" />
                          <span>{res.properties.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {(role === 'tcu' || role === 'mp' || role === 'cidadao' || role === 'gestor' || role === 'auditor') && (
                  <OuvidoriaWidget isOpen={ouvidoriaOpen} setIsOpen={setOuvidoriaOpen} />
                )}
                
                {(role === 'gestor' || role === 'tcu' || role === 'mp') && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', pointerEvents: 'auto', position: 'relative' }}>
                    <button 
                      className={`btn-heat ${showHeatmap ? 'active' : ''}`}
                      onClick={() => setShowHeatmap(!showHeatmap)}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '24px', border: '1px solid var(--border-glass)', background: showHeatmap ? 'rgba(239, 68, 68, 0.2)' : 'var(--bg-card)', color: showHeatmap ? '#ef4444' : 'var(--text-primary)', cursor: 'pointer', transition: 'all 0.3s' }}
                    >
                      <Flame size={16} />
                      <span>{t('heatmap')}</span>
                    </button>
                    
                    <button
                      onClick={() => setShowSimularDropdown(!showSimularDropdown)}
                      style={{ marginLeft: '12px', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '24px', border: '1px solid #3b82f6', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      <span>Simular</span>
                      <span style={{ fontSize: '10px' }}>▼</span>
                    </button>

                    {showSimularDropdown && (
                      <div style={{ position: 'absolute', top: '100%', left: '160px', marginTop: '8px', background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: '12px', overflow: 'hidden', zIndex: 1000, minWidth: '150px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                        {['Alagamento', 'Chuva', 'Incêndio'].map((type, i) => (
                          <div 
                            key={i} 
                            onClick={() => {
                              setShowSimularDropdown(false);
                              setRaioXData({ type });
                            }}
                            style={{ padding: '12px 16px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', borderBottom: i < 2 ? '1px solid var(--border-glass)' : 'none' }}
                            onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                            onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                          >
                            {type}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="role-dashboard fade-in">
          <div className="welcome-banner glass-panel">
            <h1>
              {role === 'cidadao' && t('welcomeCidadao')}
              {role === 'tcu' && t('welcomeTcu')}
              {role === 'mp' && "Ministério Público"}
              {role === 'auditor' && t('welcomeAuditor')}
            </h1>
            <p>
              {role === 'cidadao' && t('welcomeCidadaoDesc')}
              {role === 'tcu' && t('welcomeTcuDesc')}
              {role === 'mp' && "Acompanhamento individual de ocorrências climáticas. Integramos os dados reportados com as plataformas e-OUV e Fala.BR, permitindo Ações Civis Públicas (ACP) direcionadas a problemas de infraestrutura local."}
              {role === 'auditor' && t('welcomeAuditorDesc')}
            </p>
          </div>
          
          <div className="role-widgets">
            {role === 'cidadao' && (
              <>
                {/* Educa Clima 360 — pontos + descontos */}
                <div className="widget-glass-static flex-card" style={{gridColumn: 'span 2'}}>
                  <div className="widget-header"><Brain size={18} className="text-purple" /><h3 className="widget-title">{t('myEsgPanel')}</h3></div>
                  <div className="widget-body" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginTop:'16px'}}>
                    <div>
                      <div className="huge-number text-purple">150 pts</div>
                      <p className="micro-desc">{t('esgPointsDesc')}</p>
                      <div style={{marginTop:'12px', display:'flex', flexDirection:'column', gap:'6px'}}>
                        <div className="data-row"><span className="label">📸 {t('sentDemands')}</span><span className="value bold text-blue">3</span></div>
                        <div className="data-row"><span className="label">🎓 {t('completedCourses')}</span><span className="value bold" style={{color:'#10B981'}}>2</span></div>
                        <div className="data-row"><span className="label">✅ {t('resolvedTcu')}</span><span className="value bold" style={{color:'#10B981'}}>2</span></div>
                      </div>
                    </div>
                    <div>
                      <p style={{fontSize:'11px', fontWeight:'700', color:'var(--text-muted)', textTransform:'uppercase', marginBottom:'10px'}}>{t('discounts')}</p>
                      {[
                        {logo:'💊', name:'Drogasil', desc:'+5%', color:'#EF4444'},
                        {logo:'🛒', name:'Mercado Parceiro', desc:'+3%', color:'#10B981'},
                        {logo:'🏥', name:'Farmácia Parceira', desc:'+10%', color:'#3B82F6'},
                      ].map((p,i)=>(
                        <div key={i} style={{display:'flex', alignItems:'center', gap:'10px', padding:'8px', borderRadius:'8px', background:'transparent', marginBottom:'6px'}}>
                          <span style={{fontSize:'20px'}}>{p.logo}</span>
                          <div style={{flex:1}}>
                            <div style={{fontWeight:'700', fontSize:'13px'}}>{p.name}</div>
                            <div style={{fontSize:'11px', color:p.color, fontWeight:'600'}}>{p.desc}</div>
                          </div>
                          <span 
                            onClick={() => {
                              const code = p.name.substring(0,4).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000);
                              setRedeemModal({ show: true, partner: p, code });
                            }}
                            style={{fontSize:'11px', background:`${p.color}22`, color:p.color, padding:'2px 8px', borderRadius:'20px', fontWeight:'700', cursor:'pointer'}}
                          >
                            {t('redeem')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Cursos ESG */}
                <div className="widget-glass-static flex-card">
                  <div className="widget-header"><BookOpen size={18} style={{color:'#F59E0B'}} /><h3 className="widget-title">{t('courses')}</h3></div>
                  <div className="widget-body" style={{gap:'8px'}}>
                    {[
                      {name: t('c1'), pts:30, done:true},
                      {name: t('c2'), pts:30, done:true},
                      {name: t('c3'), pts:30, done:false},
                      {name: t('c4'), pts:30, done:false},
                      {name: t('c5'), pts:30, done:false},
                    ].map((c,i)=>(
                      <div key={i} style={{display:'flex', alignItems:'center', gap:'10px', padding:'10px', borderRadius:'8px', background: c.done ? 'rgba(16,185,129,0.08)' : 'rgba(0,0,0,0.1)', cursor: c.done ? 'default' : 'pointer'}}>
                        <span style={{fontSize:'18px'}}>{c.done ? '✅' : '▶️'}</span>
                        <span style={{flex:1, fontSize:'13px', fontWeight:'600', color: c.done ? 'var(--text-muted)' : 'var(--text-primary)'}}>{c.name}</span>
                        <span style={{fontSize:'11px', color:'#F59E0B', fontWeight:'700'}}>+{c.pts}pts</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cobrar — simulação */}
                <div className="widget-glass-static flex-card" style={{cursor:'pointer', border:'1px solid rgba(59,130,246,0.4)', background:'rgba(59,130,246,0.05)'}}
                  onClick={() => {
                    const modal = document.getElementById('cobrar-modal');
                    if(modal) modal.style.display = 'flex';
                  }}>
                  <div className="widget-header"><Search size={18} className="text-blue" /><h3 className="widget-title">{t('simulateDemand')}</h3></div>
                  <div className="widget-body" style={{alignItems:'center', justifyContent:'center', gap:'12px'}}>
                    <span style={{fontSize:'48px'}}>📸</span>
                    <p style={{textAlign:'center', fontSize:'14px', fontWeight:'bold', color:'var(--brand-primary)', margin:0}}>{t('simDesc')}</p>
                    <span style={{fontSize:'11px', color:'#F59E0B', fontWeight:'700', background:'rgba(245,158,11,0.1)', padding:'4px 12px', borderRadius:'20px'}}>+50 {t('points')}</span>
                  </div>
                </div>

                {/* COBRAR MODAL */}
                <div id="cobrar-modal" style={{display:'none', position:'fixed', inset:0, zIndex:9999, background:'rgba(0,0,0,0.8)', alignItems:'center', justifyContent:'center'}}
                  onClick={(e) => { if(e.target.id==='cobrar-modal') e.target.style.display='none'; }}>
                  <div style={{background:'var(--bg-card)', borderRadius:'20px', padding:'32px', maxWidth:'480px', width:'90%', border:'1px solid var(--border-glass)'}}>
                    <CobrarSimulator />
                  </div>
                </div>
              </>
            )}

            {role === 'tcu' && (
              <>
                {/* KPIs from real API */}
                <div className="widget-glass-static flex-card">
                  <div className="widget-header"><AlertTriangle size={18} style={{color:'#ef4444'}} /><h3 className="widget-title">{t('tcuOccurrences')}</h3></div>
                  <div className="widget-body">
                    <div className="huge-number" style={{color: '#ef4444'}}>{tcuData.ouvidoria.length || '—'}</div>
                  </div>
                </div>

                <div className="widget-glass-static flex-card">
                  <div className="widget-header"><TrendingUp size={18} className="text-blue" /><h3 className="widget-title">{t('tcuEvolution')}</h3></div>
                  <div className="widget-body" style={{gap: '8px'}}>
                    {tcuData.stats.length > 0 ? tcuData.stats.map((s, i) => {
                      const color = s.percentage >= 60 ? '#10B981' : s.percentage >= 40 ? '#F59E0B' : '#EF4444';
                      const label = s.percentage >= 60 ? '✔️ Avançado' : s.percentage >= 40 ? '⚠️ Intermediário' : '❌ Inicial';
                      return (
                        <div key={i} className="data-row">
                          <span className="label">{s.axis}</span>
                          <span className="value bold" style={{color}}>{s.percentage}% — {label}</span>
                        </div>
                      );
                    }) : <p className="micro-desc">{t('loading')}</p>}
                  </div>
                </div>

                {/* Last 5 ouvidoria entries as demandas */}
                <div className="widget-glass-static flex-card">
                  <div className="widget-header"><Map size={18} className="text-purple" /><h3 className="widget-title">{t('tcuRecent')}</h3></div>
                  <div className="widget-body" style={{gap: '8px'}}>
                      {tcuData.ouvidoria.length > 0
                        ? tcuData.ouvidoria.slice(0, 5).map((o, i) => (
                            <div key={i} className="data-row">
                              <span className="label">{o.bairro || 'DF'}</span>
                              <span className="value bold" style={{color: '#ef4444', fontSize: '11px'}}>{o.assunto_nome || 'Ocorrência Climática'}</span>
                            </div>
                          ))
                        : <p className="micro-desc">{t('tcuNoOccurrences')}</p>
                      }
                  </div>
                </div>

  
              {role === 'mp' && (
                <>
                  <div className="widget-glass-static flex-card">
                    <div className="widget-header"><AlertTriangle size={18} style={{color:'#ef4444'}} /><h3 className="widget-title">Demandas Locais (Varejo)</h3></div>
                    <div className="widget-body">
                      <div className="huge-number" style={{color: '#ef4444'}}>{tcuData.ouvidoria.length || '—'}</div>
                      <p className="micro-desc">Problemas reportados via Fala.BR e App</p>
                    </div>
                  </div>

                  <div className="widget-glass-static flex-card">
                    <div className="widget-header"><TrendingUp size={18} className="text-blue" /><h3 className="widget-title">Ações Civis Públicas (ACP)</h3></div>
                    <div className="widget-body" style={{gap: '8px'}}>
                      <div className="data-row">
                        <span className="label">Em andamento</span>
                        <span className="value bold" style={{color: '#F59E0B'}}>12</span>
                      </div>
                      <div className="data-row">
                        <span className="label">Concluídas (2025)</span>
                        <span className="value bold" style={{color: '#10B981'}}>4</span>
                      </div>
                      <div className="data-row">
                        <span className="label">TACs Firmados</span>
                        <span className="value bold" style={{color: '#3B82F6'}}>8</span>
                      </div>
                    </div>
                  </div>

                  <div className="widget-glass-static flex-card">
                    <div className="widget-header"><Map size={18} className="text-purple" /><h3 className="widget-title">Ouvidoria MPDFT (Recentes)</h3></div>
                    <div className="widget-body" style={{gap: '8px'}}>
                      {tcuData.ouvidoria.length > 0 ? tcuData.ouvidoria.filter(d => ['queimada', 'desmatamento', 'lixo', 'poluição', 'descarte', 'erosão'].some(k => d.assunto_nome?.toLowerCase().includes(k))).slice(0, 5).map((d, i) => (
                        <div key={i} className="data-row" style={{ alignItems: 'flex-start' }}>
                          <span className="label" style={{ flex: 1 }}>
                            <strong>{d.protocolo || 'OUV'}</strong><br/>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{d.assunto_nome} - {d.bairro}</span>
                          </span>
                          <span className="value bold" style={{ fontSize: '11px', background: '#3b82f620', padding: '2px 6px', borderRadius: '4px', color: '#3b82f6', cursor: 'pointer' }}>Autuar</span>
                        </div>
                      )) : <p className="micro-desc">Nenhuma demanda temática encontrada.</p>}
                    </div>
                  </div>
                </>
              )}
                {/* ESG Partners (TCU cadastra) */}
                <div className="widget-glass-static flex-card">
                  <div className="widget-header"><Store size={18} style={{color:'#10B981'}} /><h3 className="widget-title">Parceiros ESG</h3></div>
                  <div className="widget-body" style={{gap:'8px'}}>
                    {esgPartners.map((p,i)=>(
                      <div key={i} style={{display:'flex', alignItems:'center', gap:'10px', padding:'8px', borderRadius:'8px', background:'transparent'}}>
                        <div style={{padding:'4px'}}>
                          <Store size={18} color="#10B981" />
                        </div>
                        <div style={{flex:1}}>
                          <div style={{fontWeight:'700', fontSize:'12px'}}>{p.name}</div>
                          <div style={{fontSize:'11px', color:'var(--text-muted)'}}>+{p.percent} {p.desc}</div>
                        </div>
                        <span style={{fontSize:'10px', background:'rgba(16,185,129,0.15)', color:'#10B981', padding:'2px 8px', borderRadius:'20px', fontWeight:'700'}}>Ativo</span>
                      </div>
                    ))}
                    <button 
                      onClick={() => setShowEsgModal(true)}
                      style={{marginTop:'8px', width:'100%', padding:'8px', background:'rgba(16,185,129,0.1)', color:'#10B981', border:'1px solid rgba(16,185,129,0.3)', borderRadius:'8px', fontWeight:'700', cursor:'pointer', fontSize:'12px'}}>
                      + Cadastrar Novo Parceiro ESG
                    </button>
                  </div>
                </div>
              </>
            )}

            {role === 'auditor' && (
              <>
                <div className="widget-glass-static flex-card">
                  <div className="widget-header"><Search size={18} className="text-blue" /><h3 className="widget-title">Portal da Transparência</h3></div>
                  <div className="widget-body">
                    <div className="data-row"><span className="label">Fundo Previsto</span><span className="value bold">R$ 15.000.000</span></div>
                    <div className="data-row"><span className="label">Fundo Gasto</span><span className="value bold" style={{color: '#ef4444'}}>R$ 2.500.000</span></div>
                  </div>
                </div>
                <div className="widget-glass-static flex-card">
                  <div className="widget-header"><Brain size={18} className="text-purple" /><h3 className="widget-title">Sugestão de Auditoria (IA)</h3></div>
                  <div className="widget-body">
                    <p className="micro-desc" style={{fontSize: '13px', lineHeight: '1.4'}}>
                      <strong style={{color: '#ef4444'}}>Alerta de Falha Governamental:</strong><br/>
                      Há R$ 12.5M não aplicados, enquanto 14 ocorrências em Vicente Pires permanecem com status "Não Iniciada". A IA sugere notificação imediata.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ESG Partner Modal */}
      {showEsgModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '16px', width: '100%', maxWidth: '400px', border: '1px solid var(--border-glass)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '800' }}>Cadastrar Parceiro ESG</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>Nome do Parceiro</label>
                <input type="text" style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border-glass)', background: 'rgba(0,0,0,0.1)', color: 'var(--text-primary)' }} value={newEsgPartner.name} onChange={e => setNewEsgPartner({...newEsgPartner, name: e.target.value})} placeholder="Ex: Supermercado XYZ" />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>Endereço</label>
                <input type="text" style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border-glass)', background: 'rgba(0,0,0,0.1)', color: 'var(--text-primary)' }} value={newEsgPartner.address} onChange={e => setNewEsgPartner({...newEsgPartner, address: e.target.value})} placeholder="Ex: Quadra 10" />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>Percentual (%)</label>
                <input type="text" style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border-glass)', background: 'rgba(0,0,0,0.1)', color: 'var(--text-primary)' }} value={newEsgPartner.percent} onChange={e => setNewEsgPartner({...newEsgPartner, percent: e.target.value})} placeholder="Ex: 5%" />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>Descrição do Benefício</label>
                <input type="text" style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border-glass)', background: 'rgba(0,0,0,0.1)', color: 'var(--text-primary)' }} value={newEsgPartner.desc} onChange={e => setNewEsgPartner({...newEsgPartner, desc: e.target.value})} placeholder="Ex: desconto em todas as compras" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button 
                onClick={() => setShowEsgModal(false)}
                style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid var(--border-glass)', borderRadius: '8px', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: '600' }}
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  if (newEsgPartner.name) {
                    setEsgPartners([...esgPartners, newEsgPartner]);
                    setNewEsgPartner({ name: '', percent: '', desc: '', address: '' });
                    setShowEsgModal(false);
                  }
                }}
                style={{ flex: 1, padding: '10px', background: 'var(--brand-primary)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: '600' }}
              >
                Salvar Parceiro
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Raio-X Modal */}
      {raioXData && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'var(--bg-main)', padding: '32px', borderRadius: '16px', width: '100%', maxWidth: '600px', border: '1px solid #3b82f6', boxShadow: '0 0 40px rgba(59,130,246,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ScanEye size={28} /> Raio-X: {raioXData.type}
              </h2>
              <button onClick={() => setRaioXData(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '24px' }}>✕</button>
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Métricas Principais (DF)</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-glass)', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 'bold' }}>Governança</div>
                  <div style={{ fontSize: '24px', fontWeight: '900', color: '#ef4444' }}>39%</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-glass)', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 'bold' }}>Financiamento</div>
                  <div style={{ fontSize: '24px', fontWeight: '900', color: '#ef4444' }}>22%</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-glass)', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 'bold' }}>Políticas públicas</div>
                  <div style={{ fontSize: '24px', fontWeight: '900', color: '#f59e0b' }}>43%</div>
                </div>
              </div>
            </div>

            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', padding: '16px', borderRadius: '12px', marginBottom: '24px' }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#ef4444', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}><AlertTriangle size={16}/> Diagnóstico Crítico</h4>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-primary)', lineHeight: '1.5' }}>
                O GDF apresenta falha na ação preventiva e mitigação para <strong>{raioXData.type}</strong>. A política referente encontra-se com execução orçamentária travada e sem efetividade comprovada nos últimos 6 meses.
              </p>
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', padding: '16px', borderRadius: '12px', marginBottom: '24px' }}>
              <h4 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)', fontSize: '14px' }}>O que deve ser feito (Recomendação IA):</h4>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                <li>Acionar plano de contingência imediatamente nas áreas mapeadas de alto risco.</li>
                <li>Desbloquear repasse de Financiamento (atualmente estagnado em 22%).</li>
                <li>Notificar gestores regionais para execução de obras mitigadoras.</li>
              </ul>
            </div>

            {raioXData.sent ? (
              <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(16,185,129,0.1)', color: '#10b981', borderRadius: '12px', fontWeight: 'bold', border: '1px solid rgba(16,185,129,0.3)' }}>
                ✅ Cobrança oficial registrada no TCU com sucesso!
              </div>
            ) : (
              <button 
                onClick={async () => {
                  try {
                    await fetch('/api/ouvidoria', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        assunto_nome: raioXData.type + ' (Simulação de Fiscalização)',
                        bairro: 'Todo o DF',
                        descricao: 'Cobrança automatizada pelo sistema Raio-X devido a baixos índices nos eixos de Governança, Financiamento e Políticas Públicas.',
                        latitude: -15.792,
                        longitude: -47.882
                      })
                    });
                    setRaioXData({ ...raioXData, sent: true });
                    setTimeout(() => setRaioXData(null), 3000);
                  } catch(e) {}
                }}
                style={{ width: '100%', padding: '14px', background: '#ef4444', border: 'none', borderRadius: '12px', color: '#fff', cursor: 'pointer', fontWeight: '900', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(239,68,68,0.4)' }}
              >
                <Send size={18} /> Disparar Cobrança Direta ao TCU
              </button>
            )}
          </div>
        </div>
      )}

      {/* Redeem Modal */}
      {redeemModal.show && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '16px', width: '100%', maxWidth: '350px', border: '1px solid var(--border-glass)', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>{redeemModal.partner.logo}</div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: '800' }}>{redeemModal.partner.name}</h3>
            <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: 'var(--text-secondary)' }}>
              Mostre este código no caixa para resgatar seu benefício de {redeemModal.partner.desc}.
            </p>
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px', border: '2px dashed var(--brand-primary)', marginBottom: '24px' }}>
              <div style={{ fontSize: '24px', fontWeight: '900', letterSpacing: '2px', color: 'var(--brand-primary)' }}>
                {redeemModal.code}
              </div>
            </div>
            <button 
              onClick={() => setRedeemModal({ show: false, partner: null, code: '' })}
              style={{ width: '100%', padding: '12px', background: 'var(--brand-primary)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .map-wrapper { position: relative; width: 100%; height: 100%; overflow: hidden; background: var(--bg-main); }
        .map-fullscreen-container { position: absolute; inset: 0; z-index: 1; }
        .map-tools { position: absolute; top: 16px; left: 50%; transform: translateX(-50%); z-index: 10; display: flex; gap: 12px; }
        
        .role-dashboard { padding: 40px; display: flex; flex-direction: column; gap: 24px; height: 100%; overflow-y: auto; }
        .welcome-banner { padding: 32px; border-radius: 16px; background: var(--bg-card); border: 1px solid var(--border-glass); }
        .welcome-banner h1 { font-family: var(--font-outfit); font-size: 28px; color: var(--text-primary); margin-bottom: 8px; }
        .welcome-banner p { color: var(--text-secondary); font-size: 14px; margin: 0; }
        .role-widgets { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; }
        
        .widget-glass-static { background: var(--bg-card); border: 1px solid var(--border-glass); border-radius: 16px; padding: 24px; color: var(--text-primary); }
        .flex-card { display: flex; flex-direction: column; }
        .widget-glass-static .widget-body { display: flex; flex-direction: column; gap: 16px; margin-top: 16px; flex: 1; justify-content: center;}
        
        .data-row { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-glass); padding-bottom: 8px; }
        .data-row .label { font-size: 14px; color: var(--text-secondary); }
        .data-row .value { font-size: 14px; }
        .bold { font-weight: 700; }
        .huge-number { font-family: var(--font-outfit); font-size: 36px; font-weight: 800; margin-bottom: 4px; }
        .micro-desc { font-size: 12px; color: var(--text-muted); margin: 0; }

        .progress-bar-container { width: 100%; height: 8px; background: rgba(0,0,0,0.2); border-radius: 4px; overflow: hidden; margin-top: 8px;}
        .progress-bar-fill { height: 100%; background: var(--brand-primary); }
        
        .badge-showcase { display: flex; gap: 16px; }
        .badge-item { display: flex; flex-direction: column; align-items: center; gap: 8px; }
        .medal-icon { width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; }
        .medal-icon.gold { background: rgba(245, 158, 11, 0.2); border: 2px solid #F59E0B; }
        .medal-icon.silver { background: rgba(156, 163, 175, 0.2); border: 2px solid #9CA3AF; }
        .badge-item span { font-size: 11px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; }

        .search-box { display: flex; align-items: center; gap: 8px; padding: 8px 16px; background: var(--bg-card); border: 1px solid var(--border-glass); border-radius: 30px; backdrop-filter: blur(8px); }
        .search-box input { background: transparent; border: none; color: var(--text-primary); outline: none; width: 200px; font-family: var(--font-inter); font-size: 13px; }
        .btn-heat { display: flex; align-items: center; gap: 6px; padding: 8px 16px; background: var(--bg-card); border: 1px solid var(--border-glass); border-radius: 30px; color: var(--text-primary); font-size: 13px; cursor: pointer; backdrop-filter: blur(8px); transition: 0.2s; }
        .btn-heat:hover, .btn-heat.active { background: rgba(239, 68, 68, 0.2); border-color: #EF4444; }

        .widget-glass { position: absolute; z-index: 10; background: var(--bg-card); border: 1px solid var(--border-glass); border-radius: 12px; box-shadow: var(--shadow-glass); padding: 16px; display: flex; flex-direction: column; pointer-events: auto; color: var(--text-primary); }
        .widget-header { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; border-bottom: 1px solid var(--border-glass); padding-bottom: 10px; }
        .widget-title { font-family: var(--font-inter); font-size: 12px; font-weight: 800; color: var(--text-primary); margin: 0; flex: 1; text-transform: uppercase; }

        .text-blue { color: #3B82F6; }
        .text-green { color: #10B981; }
        .text-purple { color: #8B5CF6; }

        .widget-bottom-left { bottom: 20px; left: 20px; width: 240px; align-items: center; }
        .badge-ouro { background: rgba(245, 158, 11, 0.2); color: #F59E0B; font-size: 10px; font-weight: 800; padding: 4px 8px; border-radius: 12px; text-transform: uppercase; }
        .index-circle { width: 80px; height: 80px; border-radius: 50%; border: 4px solid var(--brand-primary); display: flex; align-items: center; justify-content: center; background: radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%); margin-bottom: 12px; }
        .index-value { font-size: 28px; font-weight: 800; font-family: var(--font-inter); color: var(--text-primary); }
        .index-metrics { display: flex; gap: 16px; width: 100%; justify-content: center; }
        .metric { display: flex; flex-direction: column; align-items: center; }
        .metric .label { font-size: 10px; color: var(--text-muted); font-weight: 600; text-transform: uppercase; margin-bottom: 2px;}
        .metric .value { font-size: 14px; font-weight: 800; }

        .widget-top-right { top: 16px; right: 20px; width: 280px; }
        .ai-feed { display: flex; flex-direction: column; gap: 8px; overflow-y: auto; max-height: 80px; }
        .ai-feed::-webkit-scrollbar { width: 4px; }
        .ai-feed::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.2); border-radius: 4px; }
        .ai-message { background: rgba(0,0,0,0.1); padding: 10px; border-radius: 8px; font-size: 11px; color: var(--text-secondary); line-height: 1.4; border-left: 3px solid #3B82F6; }
        .ai-message strong { color: var(--text-primary); }

        .widget-bottom-right { bottom: 20px; right: 20px; width: 280px; }
        .roi-stats { display: flex; justify-content: space-between; margin-bottom: 12px; }
        .roi-item { display: flex; flex-direction: column; gap: 2px; }
        .roi-label { font-size: 10px; color: var(--text-muted); font-weight: 600; text-transform: uppercase; }
        .roi-value { font-size: 16px; font-weight: 800; }
        .compliance-list { display: flex; flex-direction: column; gap: 6px; background: rgba(0,0,0,0.1); padding: 10px; border-radius: 8px; }
        .compliance-item { display: flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 600; color: var(--text-secondary); }

        .widget-center-right { top: 160px; right: 20px; width: 280px; }
        .iot-status { display: flex; flex-direction: column; gap: 8px; }
        .iot-device { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 500; color: var(--text-secondary); }
        .dot-status { width: 8px; height: 8px; border-radius: 50%; }
        .online .dot-status { background: #10B981; box-shadow: 0 0 8px #10B981; }
        .offline .dot-status { background: #EF4444; }

        .fade-in { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </main>
  );
}
