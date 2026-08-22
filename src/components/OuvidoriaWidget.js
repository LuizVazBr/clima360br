"use client";

import React, { useEffect, useState } from 'react';
import { MessageSquareWarning, ThermometerSun, MapPin, Users } from 'lucide-react';
import { createPortal } from 'react-dom';

export default function OuvidoriaWidget({ isOpen, setIsOpen }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/ouvidoria_data.json')
      .then(res => res.json())
      .then(d => setData(d))
      .catch(e => console.error(e));
  }, []);

  if (!data) return null;

  const getAssuntoName = (id) => {
    const nomes = {
      '1283': 'Queimadas (Terrenos Particulares)',
      '1305': 'Queimada (APP)',
      '1585': 'Queimadas (Área Pública)',
      '972': 'Dano ao Meio Ambiente'
    };
    return nomes[id] || 'Problema Climático';
  };

  const widgetContent = isOpen && (
    <div style={{
      position: 'absolute',
      bottom: '70px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '400px',
      background: 'var(--bg-card, rgba(30, 41, 59, 0.95))',
      backdropFilter: 'blur(12px)',
      border: '1px solid var(--border-glass, rgba(255,255,255,0.1))',
      borderRadius: '16px',
      padding: '20px',
      color: '#fff',
      zIndex: 1000,
      boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <MessageSquareWarning size={20} color="#3b82f6" />
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>Radar OUV-DF</h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(59, 130, 246, 0.2)', padding: '4px 10px', borderRadius: '12px' }}>
          <Users size={14} color="#3b82f6" />
          <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#60a5fa' }}>
            {data.totalOuvidorias.toLocaleString('pt-BR')} registros totais
          </span>
        </div>
      </div>

      <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <ThermometerSun size={24} color="#ef4444" />
        <div>
          <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#ef4444' }}>{data.climateTotal.toLocaleString('pt-BR')}</h4>
          <span style={{ fontSize: '12px', color: '#fca5a5' }}>Reclamações Climáticas (Fogo/Dano)</span>
        </div>
      </div>

      <h5 style={{ fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.5px' }}>Ocorrências Recentes</h5>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '250px', overflowY: 'auto', paddingRight: '5px' }}>
        {data.recentClimateComplaints.map((c, i) => (
          <div key={i} style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px', borderLeft: '3px solid #ef4444' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff' }}>{getAssuntoName(c.assuntoId)}</span>
              <span style={{ fontSize: '11px', color: '#6b7280' }}>ID: {c.id}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#9ca3af', fontSize: '11px' }}>
              <MapPin size={12} />
              <span>{c.bairro || 'Brasília/DF'}</span>
              <span style={{ marginLeft: 'auto' }}>{c.dataAbertura.substring(0, 11)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button 
        className={`btn-heat ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', background: isOpen ? '#3b82f6' : 'var(--bg-card)', color: isOpen ? '#fff' : 'var(--text-primary)', border: '1px solid var(--border-glass)', padding: '6px 12px', height: '36px', borderRadius: '18px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
      >
        <MessageSquareWarning size={16} color={isOpen ? "#fff" : "#3b82f6"} />
        Ouvidoria
        <span style={{ color: isOpen ? '#fff' : '#3b82f6', fontWeight: 'normal', padding: '2px 6px', fontSize: '12px' }}>
          {data.climateTotal}
        </span>
      </button>
      {widgetContent}
    </div>
  );
}
