"use client";

import { useState, useMemo } from 'react';
import { Activity, Shield, DollarSign, Building2, MapPin } from 'lucide-react';

export default function DashboardClient({ data }) {
  const [activeAxis, setActiveAxis] = useState('Todos');
  const [selectedEntity, setSelectedEntity] = useState('Todas');
  
  // Extrair eixos únicos e entidades únicas com seu respectivo tipo (Estado/Município)
  const axes = ['Todos', ...new Set(data.map(d => d.axis_name))].filter(Boolean);
  const entities = ['Todas', ...new Set(data.map(d => `${d.entity_name} (${d.entity_type})`))].sort();

  // Filtrar dados baseados nas seleções
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchAxis = activeAxis === 'Todos' || item.axis_name === activeAxis;
      const entityLabel = `${item.entity_name} (${item.entity_type})`;
      const matchEntity = selectedEntity === 'Todas' || entityLabel === selectedEntity;
      return matchAxis && matchEntity;
    });
  }, [data, activeAxis, selectedEntity]);

  // Agrupar dados filtrados por eixo > componente > item
  const groupedData = useMemo(() => {
    const grouped = {};
    filteredData.forEach(item => {
      if (!grouped[item.axis_name]) grouped[item.axis_name] = {};
      if (!grouped[item.axis_name][item.component_identifier]) {
        grouped[item.axis_name][item.component_identifier] = [];
      }
      grouped[item.axis_name][item.component_identifier].push(item);
    });
    return grouped;
  }, [filteredData]);

  const getAxisIcon = (axis) => {
    if (axis.includes('Governança')) return <Shield size={20} color="#3B82F6" />;
    if (axis.includes('Financiamento')) return <DollarSign size={20} color="#10B981" />;
    if (axis.includes('Políticas')) return <Activity size={20} color="#F59E0B" />;
    return <Building2 size={20} />;
  };

  const getAxisColor = (axis) => {
    if (axis.includes('Governança')) return 'rgba(59, 130, 246, 0.1)';
    if (axis.includes('Financiamento')) return 'rgba(16, 185, 129, 0.1)';
    if (axis.includes('Políticas')) return 'rgba(245, 158, 11, 0.1)';
    return 'rgba(255,255,255,0.05)';
  };

  return (
    <div style={{ padding: '32px', height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* HEADER */}
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
          Painel ClimaBrasil
        </h1>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>
          Organização Metodológica: Avaliação de ações implementadas por estados e municípios.
        </p>
      </div>

      {/* FILTROS */}
      <div style={{ display: 'flex', gap: '16px', background: 'var(--bg-card)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 'bold' }}>
            EIXO TEMÁTICO
          </label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {axes.map(axis => (
              <button 
                key={axis}
                onClick={() => setActiveAxis(axis)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '30px',
                  border: 'none',
                  background: activeAxis === axis ? 'var(--brand-primary)' : 'var(--input-bg)',
                  color: activeAxis === axis ? '#fff' : 'var(--text-primary)',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '600',
                  transition: '0.2s',
                  border: '1px solid var(--border-glass)'
                }}
              >
                {axis}
              </button>
            ))}
          </div>
        </div>
        
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 'bold' }}>
            ESTADO / MUNICÍPIO
          </label>
          <div style={{ position: 'relative' }}>
            <MapPin size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '10px' }} />
            <select 
              value={selectedEntity} 
              onChange={e => setSelectedEntity(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 10px 10px 36px',
                borderRadius: '8px',
                border: '1px solid var(--border-glass)',
                background: 'var(--input-bg)',
                color: 'var(--text-primary)',
                fontSize: '14px',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {entities.map(ent => <option key={ent} value={ent}>{ent}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ÁREA DOS DADOS ORGANIZADOS */}
      {Object.entries(groupedData).length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Nenhum dado encontrado para os filtros selecionados.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {Object.entries(groupedData).map(([axisName, components]) => (
            <div key={axisName} style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-glass)', overflow: 'hidden' }}>
              
              <div style={{ background: getAxisColor(axisName), padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--border-glass)' }}>
                {getAxisIcon(axisName)}
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Eixo: {axisName}</h2>
              </div>
              
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {Object.entries(components).sort().map(([compName, items]) => (
                  <div key={compName}>
                    <h3 style={{ fontSize: '16px', color: 'var(--text-primary)', marginBottom: '16px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px' }}>
                      Componente <span style={{ color: 'var(--brand-primary)', fontWeight: 'bold' }}>{compName}</span>
                    </h3>
                    
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                        <thead>
                          <tr style={{ background: 'var(--input-bg)', textAlign: 'left' }}>
                            <th style={{ padding: '10px 12px', color: 'var(--text-secondary)', fontWeight: '600' }}>Item</th>
                            {selectedEntity === 'Todas' && <th style={{ padding: '10px 12px', color: 'var(--text-secondary)', fontWeight: '600' }}>Entidade</th>}
                            <th style={{ padding: '10px 12px', color: 'var(--text-secondary)', fontWeight: '600' }}>Nota / Progresso</th>
                            <th style={{ padding: '10px 12px', color: 'var(--text-secondary)', fontWeight: '600' }}>Valor Numérico</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.sort((a,b) => a.item_identifier.localeCompare(b.item_identifier)).map((item, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                              <td style={{ padding: '10px 12px', color: 'var(--text-primary)', fontWeight: 'bold', width: '60px' }}>{item.item_identifier}</td>
                              {selectedEntity === 'Todas' && (
                                <td style={{ padding: '10px 12px', color: 'var(--text-primary)' }}>
                                  {item.entity_name} <span style={{ color: 'var(--text-muted)', fontSize: '11px', marginLeft: '4px' }}>({item.entity_type})</span>
                                </td>
                              )}
                              <td style={{ padding: '10px 12px' }}>
                                <span style={{ 
                                  background: item.score_value > 0 ? 'rgba(16, 185, 129, 0.1)' : 'var(--input-bg)', 
                                  color: item.score_value > 0 ? '#10B981' : 'var(--text-secondary)',
                                  padding: '4px 8px', borderRadius: '4px', fontWeight: '600'
                                }}>
                                  {item.score_text || 'Não avaliado'}
                                </span>
                              </td>
                              <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{item.score_value || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
