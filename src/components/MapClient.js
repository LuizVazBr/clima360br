"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, Circle, CircleMarker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import RaioXClimatico from '@/components/RaioXClimatico';
import { Layers, MapPin, Droplets, Thermometer, Flame } from 'lucide-react';
import { useLang } from '@/contexts/LangContext';

const createCustomIcon = () => {
  return new L.divIcon({
    className: 'custom-pin-wrapper',
    html: `
      <div style="background-color: var(--brand-primary); width: 24px; height: 24px; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);"></div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

const createHeatIcon = () => {
  return new L.divIcon({
    className: 'custom-pin-wrapper',
    html: `
      <div style="background-color: #ef4444; width: 30px; height: 30px; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 0 15px rgba(239, 68, 68, 0.6); display: flex; align-items: center; justify-content: center; opacity: 0.8;">🔥</div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

const iconCity = createCustomIcon();
const iconHeat = createHeatIcon();

const CITIES_MOCK = [
  { id: 1, name: 'São Paulo', state: 'SP', lat: -23.5505, lng: -46.6333 },
  { id: 2, name: 'Rio de Janeiro', state: 'RJ', lat: -22.9068, lng: -43.1729 },
  { id: 3, name: 'Belo Horizonte', state: 'MG', lat: -19.9167, lng: -43.9345 },
  { id: 4, name: 'Brasília', state: 'DF', lat: -15.7938, lng: -47.8828 },
  { id: 5, name: 'Manaus', state: 'AM', lat: -3.1190, lng: -60.0217 },
  { id: 6, name: 'Recife', state: 'PE', lat: -8.0476, lng: -34.8770 },
  { id: 7, name: 'Curitiba', state: 'PR', lat: -25.4284, lng: -49.2733 },
  { id: 8, name: 'Porto Alegre', state: 'RS', lat: -30.0346, lng: -51.2177 },
];

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 13, { animate: true, duration: 1.5 });
    }
  }, [center, map]);
  return null;
}

function HeatmapFlyer({ showHeatmap, riskZones, mapCenter }) {
  const map = useMap();
  useEffect(() => {
    if (showHeatmap && riskZones.length > 0) {
      map.flyTo(mapCenter, 11, { animate: true, duration: 1.5 });
    }
  }, [showHeatmap, riskZones, map, mapCenter]);
  return null;
}

function MapBoundsTracker({ onBoundsChange }) {
  const map = useMapEvents({
    moveend: () => onBoundsChange(map.getBounds()),
    zoomend: () => onBoundsChange(map.getBounds())
  });
  useEffect(() => {
    onBoundsChange(map.getBounds());
  }, [map, onBoundsChange]);
  return null;
}

export default function MapClient({ showHeatmap, searchCenter, ouvidoriaOpen }) {
  const { t } = useLang();
  
  const LAYERS = [
    { id: 'painel', label: 'Painel ClimaBrasil', icon: <Layers size={14} />, source: 'Painel ClimaBrasil' },
    { id: 'inundacao', label: t('riskFlood'), icon: <Droplets size={14} />, source: 'Defesa Civil (DF)' },
    { id: 'temperatura', label: 'Anomalia Térmica (INMET)', icon: <Thermometer size={14} />, source: 'INMET' },
    { id: 'incendio', label: t('fireSpots'), icon: <Flame size={14} />, source: 'INPE' },
    { id: 'co2', label: 'Índice CO (Qualidade)', icon: <Layers size={14} />, source: 'Open-Meteo' },
  ];

  const MAP_STYLES = [
    { id: 'satellite', name: t('satellite'), url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', sub: 'abc' },
    { id: 'hybrid', name: t('hybrid'), url: 'https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', sub: ['mt0','mt1','mt2','mt3'] },
    { id: 'light', name: t('light'), url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', sub: 'abc' },
    { id: 'dark', name: t('dark'), url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', sub: 'abc' },
  ];

  const [selectedCity, setSelectedCity] = useState(null);
  const [activeLayers, setActiveLayers] = useState(['painel']);
  const [activeStyle, setActiveStyle] = useState(3);
  const [mounted, setMounted] = useState(false);
  const [heatPoints, setHeatPoints] = useState([]);
  const [riskZones, setRiskZones] = useState([]);
  const [co2Data, setCo2Data] = useState([]);
  const [emissoesDfData, setEmissoesDfData] = useState(null);
  
  const [mapCenter, setMapCenter] = useState([-15.7938, -47.8828]);
  const [mapBounds, setMapBounds] = useState(null);

  useEffect(() => {
    setMounted(true);
    // Buscar coord inicial do banco
    fetch('/api/configuracoes')
      .then(res => res.json())
      .then(data => {
        if(data && data.lat && data.lng) {
          setMapCenter([data.lat, data.lng]);
        }
      })
      .catch(console.error);

    // Buscar CO2
    fetch('/api/co2')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCo2Data(data);
      })
      .catch(console.error);

    // Buscar Emissões (SEEG/Reais)
    fetch('/api/emissoes-df')
      .then(res => res.json())
      .then(data => setEmissoesDfData(data))
      .catch(console.error);

    const updateMapStyle = () => {
      const isLight = document.body.classList.contains('light-mode');
      setActiveStyle(isLight ? 2 : 3); // 2 = Light, 3 = Dark
    };

    updateMapStyle();
    
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          updateMapStyle();
        }
      });
    });
    observer.observe(document.body, { attributes: true });

    const handleFlyTo = (e) => {
      if (e.detail && e.detail.lat && e.detail.lng) {
        setMapCenter([parseFloat(e.detail.lat), parseFloat(e.detail.lng)]);
      }
    };
    window.addEventListener('flyTo', handleFlyTo);

    return () => {
      observer.disconnect();
      window.removeEventListener('flyTo', handleFlyTo);
    };
  }, []);

  useEffect(() => {
    if (ouvidoriaOpen && heatPoints.length === 0) {
      // Tenta ler do banco (CSV carregado pelo gestor), se vazio cai no JSON local
      fetch('/api/ouvidoria')
        .then(r => r.json())
        .then(dbRows => {
          if (Array.isArray(dbRows) && dbRows.length > 0) {
            const points = dbRows.map(c => {
              let color = '#ef4444'; // Vermelho padrao (Queimada)
              if (c.assunto_id === '972') color = '#eab308';
              else if (c.assunto_id === '1585') color = '#f97316';
              else if (c.assunto_nome && (c.assunto_nome.toLowerCase().includes('alagamento') || c.assunto_nome.toLowerCase().includes('inundação'))) color = '#3b82f6';
              return {
                ...c,
                bairro: c.bairro || 'DF',
                assuntoNome: c.assunto_nome || 'Ocorrência',
                color,
                lat: parseFloat(c.lat) || (-15.7938 + (Math.random() - 0.5) * 0.04),
                lng: parseFloat(c.lng) || (-47.8828 + (Math.random() - 0.5) * 0.04)
              };
            });
            setHeatPoints(points);
          } else {
            // Fallback para JSON local
            fetch('/ouvidoria_data.json')
              .then(r => r.json())
              .then(data => {
                const coords = {
                  'Brasília': [-15.7938, -47.8828], 'Asa Sul': [-15.814, -47.893],
                  'Asa Norte': [-15.760, -47.876], 'Taguatinga': [-15.833, -48.056],
                  'Ceilândia': [-15.820, -48.112], 'Gama': [-16.017, -48.066],
                  'Sobradinho': [-15.651, -47.789], 'Planaltina': [-15.452, -47.614],
                  'Vicente Pires': [-15.801, -48.026], 'Guaará': [-15.823, -47.978]
                };
                
                // MOCK INJETANDO ALAGAMENTO (Para testes visuais do cidadão e gestão)
                const mockAlagamento = [
                  { id: 999991, ano: 2026, assuntoId: 'ALAG', assuntoNome: 'Alagamento Via Pública', bairro: 'Vicente Pires' },
                  { id: 999992, ano: 2026, assuntoId: 'ALAG', assuntoNome: 'Risco de Inundação', bairro: 'Ceilândia' },
                  { id: 999993, ano: 2026, assuntoId: 'ALAG', assuntoNome: 'Alagamento em Residência', bairro: 'Taguatinga' },
                  { id: 999994, ano: 2026, assuntoId: 'ALAG', assuntoNome: 'Alagamento Via Pública', bairro: 'Asa Norte' },
                ];
                
                const combined = [...(data.recentClimateComplaints || []), ...mockAlagamento];

                const points = combined.map(c => {
                  let latlon = coords['Brasília'];
                  for (const key of Object.keys(coords)) {
                    if (c.bairro && c.bairro.includes(key)) { latlon = coords[key]; break; }
                  }
                  let color = '#ef4444';
                  if (c.assuntoId === '972') color = '#eab308';
                  else if (c.assuntoId === '1585') color = '#f97316';
                  else if (c.assuntoId === 'ALAG') color = '#3b82f6';
                  return { ...c, assuntoNome: c.assuntoNome || 'Queimada', color, lat: latlon[0] + (Math.random()-0.5)*0.02, lng: latlon[1] + (Math.random()-0.5)*0.02 };
                });
                setHeatPoints(points);
              });
          }
        })
        .catch(() => {
          setHeatPoints([]);
        });
    }
  }, [ouvidoriaOpen, heatPoints.length]);

  useEffect(() => {
    if (showHeatmap && riskZones.length === 0) {
      // Busca dados reais através da API interna do sistema
      fetch('/api/riscos')
        .then(res => res.json())
        .then(data => setRiskZones(data))
        .catch(err => console.error("Erro ao buscar áreas de risco da API", err));
    }
  }, [showHeatmap, riskZones.length]);

  const toggleLayer = (layerId) => {
    setActiveLayers(prev => {
      const isActivating = !prev.includes(layerId);
      if (isActivating) {
        let newCenter = [-15.7938, -47.8828];
        if (layerId === 'inundacao') newCenter = [-15.801, -48.026]; // Vicente Pires
        if (layerId === 'incendio') newCenter = [-15.552, -47.614]; // Planaltina
        if (layerId === 'co2' && co2Data.length > 0) newCenter = [co2Data[0].lat, co2Data[0].lng];
        window.dispatchEvent(new CustomEvent('flyTo', { detail: { lat: newCenter[0], lng: newCenter[1] } }));
      }
      return prev.includes(layerId) ? prev.filter(l => l !== layerId) : [...prev, layerId];
    });
  };

  if (!mounted) return null;

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      
      {/* Botões de Estilo */}
      <div className="map-style-tabs">
        {MAP_STYLES.map((style, idx) => (
          <button 
            key={style.id}
            className={`style-tab-btn ${activeStyle === idx ? 'active' : ''}`}
            onClick={() => setActiveStyle(idx)}
          >
            {style.name}
          </button>
        ))}
      </div>

      <MapContainer 
        center={mapCenter} 
        zoom={14} 
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
        attributionControl={false}
      >
        <MapBoundsTracker onBoundsChange={setMapBounds} />
        <MapUpdater center={searchCenter || mapCenter} />
        <HeatmapFlyer showHeatmap={showHeatmap} riskZones={riskZones} mapCenter={mapCenter} />
        <TileLayer
          url={MAP_STYLES[activeStyle].url}
          subdomains={MAP_STYLES[activeStyle].sub}
        />

        {ouvidoriaOpen && heatPoints
          .filter(pt => mapBounds ? mapBounds.contains([pt.lat, pt.lng]) : true)
          .slice(0, 150)
          .map((pt, i) => {
          const dynamicIcon = new L.divIcon({
            className: 'custom-pin-wrapper',
            html: `
              <div style="background-color: ${pt.color}; width: 30px; height: 30px; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 0 15px ${pt.color}80; display: flex; align-items: center; justify-content: center; opacity: 0.8;">🔥</div>
            `,
            iconSize: [30, 30],
            iconAnchor: [15, 15],
          });
          return (
            <Marker key={i} position={[pt.lat, pt.lng]} icon={dynamicIcon}>
              <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                <div style={{ fontSize: '11px', fontWeight: 'bold' }}>
                  {pt.assuntoNome || 'Ocorrência climática'}
                </div>
              </Tooltip>
              <Popup>
                <div style={{ padding: '4px', minWidth: '180px' }}>
                  <strong style={{ color: pt.color, display: 'block', marginBottom: '4px' }}>
                    {pt.assuntoNome || 'Foco de Calor/Dano'}
                  </strong>
                  <div style={{ fontSize: '12px', marginBottom: '6px', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                    "{pt.descricao || 'Sem descrição detalhada.'}"
                  </div>
                  <div style={{ fontSize: '12px', marginBottom: '2px' }}><strong>Bairro:</strong> {pt.bairro !== 'Desconhecido' ? pt.bairro : 'Não especificado'}</div>
                  <div style={{ fontSize: '12px', marginBottom: '4px' }}><strong>Protocolo:</strong> {pt.protocolo || 'N/A'}</div>
                  <span style={{ fontSize: '11px', color: '#6b7280' }}>
                    Data: {pt.data_registro || pt.dataAbertura || 'Recente'}
                  </span>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {showHeatmap && riskZones.map((zone, i) => (
          <Circle 
            key={`risk-${i}`}
            center={[zone.lat, zone.lng]} 
            radius={zone.radius}
            pathOptions={{ color: zone.color, fillColor: zone.color, fillOpacity: 0.4, weight: 2 }}
          >
            <Tooltip sticky opacity={1}>
              <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
                <strong style={{ color: zone.color }}>{zone.level}</strong>
                <p style={{ margin: '4px 0', fontWeight: 'normal' }}>{zone.name}</p>
              </div>
            </Tooltip>
          </Circle>
        ))}
        
        {activeLayers.includes('inundacao') && (
          // Mock Defesa Civil (DF) Risk Zones
          <>
            <Circle center={[-15.801, -48.026]} radius={2500} pathOptions={{ color: '#0ea5e9', fillColor: '#38bdf8', fillOpacity: 0.5, weight: 1 }}>
              <Popup><strong>Defesa Civil (DF)</strong><br/>Risco de Inundação (Vicente Pires)</Popup>
            </Circle>
            <Circle center={[-15.823, -48.136]} radius={2000} pathOptions={{ color: '#0ea5e9', fillColor: '#38bdf8', fillOpacity: 0.5, weight: 1 }}>
              <Popup><strong>Defesa Civil (DF)</strong><br/>Risco de Alagamento (Sol Nascente)</Popup>
            </Circle>
            <Circle center={[-15.845, -48.012]} radius={1800} pathOptions={{ color: '#0ea5e9', fillColor: '#38bdf8', fillOpacity: 0.5, weight: 1 }}>
              <Popup><strong>Defesa Civil (DF)</strong><br/>Risco de Enchente (Arniqueiras)</Popup>
            </Circle>
          </>
        )}

        {activeLayers.includes('temperatura') && (
          // Mock INMET Temperature Anomaly
          <>
            <Circle center={[-15.7938, -47.8828]} radius={15000} pathOptions={{ color: 'transparent', fillColor: '#ef4444', fillOpacity: 0.15, weight: 0 }}>
              <Tooltip sticky>Anomalia Térmica INMET: +2.5°C acima da média</Tooltip>
            </Circle>
            <Circle center={[-15.651, -47.789]} radius={10000} pathOptions={{ color: 'transparent', fillColor: '#f97316', fillOpacity: 0.15, weight: 0 }}>
              <Tooltip sticky>Anomalia Térmica INMET: +1.8°C acima da média</Tooltip>
            </Circle>
          </>
        )}

        {activeLayers.includes('incendio') && (
          // Mock INPE Focos de Incêndio (Satélite)
          <>
            <CircleMarker center={[-15.552, -47.614]} radius={8} pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.8 }}>
              <Popup><strong>INPE (Satélite AQUA)</strong><br/>Foco Ativo - Planaltina</Popup>
            </CircleMarker>
            <CircleMarker center={[-15.875, -47.794]} radius={8} pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.8 }}>
              <Popup><strong>INPE (Satélite TERRA)</strong><br/>Foco Ativo - Jardim Botânico</Popup>
            </CircleMarker>
          </>
        )}

        {activeLayers.includes('co2') && co2Data.map((station, i) => {
          let color = '#4b5563'; // cinza escuro
          if(station.co2_index > 180) color = '#7f1d1d'; // dark red
          else if(station.co2_index > 150) color = '#78350f'; // dark brown
          
          const co2Icon = new L.divIcon({
            className: 'co2-marker',
            html: `<div style="background-color: ${color}; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 11px; border: 2px solid white; box-shadow: 0 0 10px ${color}; opacity: 0.9;">${station.co2_index}</div>`,
            iconSize: [36, 36],
            iconAnchor: [18, 18],
          });

          return (
            <Marker 
              key={`co2-${i}`} 
              position={[station.lat, station.lng]} 
              icon={co2Icon}
            >
              <Popup>
                <div style={{ minWidth: '220px', padding: '4px' }}>
                  <strong style={{ fontSize: '14px', borderBottom: '1px solid #ccc', paddingBottom: '4px', display: 'block', marginBottom: '8px' }}>
                    {station.bairro} - Qualidade do Ar
                  </strong>
                  <div style={{ marginBottom: '8px', fontSize: '12px' }}>
                    <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: color, marginRight: '4px' }}></span>
                    <strong>AQI/CO:</strong> {station.co2_index}
                    <br/>
                    <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                      PM10: {station.pm10} μg/m³ | PM2.5: {station.pm25} μg/m³
                    </span>
                  </div>

                  {emissoesDfData && emissoesDfData.detalhamento && (
                    <div style={{ marginTop: '12px', borderTop: '1px solid #ccc', paddingTop: '8px' }}>
                      <strong style={{ fontSize: '12px', color: '#374151' }}>Inventário de Emissões GEE (DF)</strong>
                      <p style={{ fontSize: '10px', color: '#6b7280', margin: '2px 0 6px 0' }}>Fonte: {emissoesDfData.fonte}</p>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {emissoesDfData.detalhamento.map((em, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: em.color }}></span>
                              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100px' }} title={em.setor}>{em.setor}</span>
                            </div>
                            <span style={{ fontWeight: 'bold', fontSize: '10px' }}>
                              {em.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} tCO₂e ({em.percentual.toLocaleString('pt-BR')}%)
                            </span>
                          </div>
                        ))}
                      </div>
                      <div style={{ marginTop: '6px', fontSize: '10px', textAlign: 'right', fontWeight: 'bold', color: '#4b5563' }}>
                        Total: {(emissoesDfData.total_tco2e / 1000000).toFixed(2)} Mi tCO₂e
                      </div>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          )
        })}
        
        {CITIES_MOCK.map(city => (
          <Marker 
            key={city.id} 
            position={[city.lat, city.lng]} 
            icon={iconCity}
            eventHandlers={{
              click: () => setSelectedCity(city)
            }}
          >
          </Marker>
        ))}
        {/* LEGEND overlay */}
        {(ouvidoriaOpen || showHeatmap) && (
          <div style={{
            position: 'absolute',
            bottom: '30px',
            right: '20px',
            backgroundColor: 'var(--bg-card)',
            backdropFilter: 'blur(10px)',
            border: '1px solid var(--border-glass)',
            padding: '12px',
            borderRadius: '12px',
            zIndex: 999,
            boxShadow: 'var(--shadow-glass)',
            pointerEvents: 'none',
            fontSize: '11px',
            color: 'var(--text-primary)'
          }}>
            {ouvidoriaOpen && (
              <>
                <div style={{ marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid var(--border-glass)' }}>
                  <strong style={{ display: 'block', fontSize: '13px', color: '#60a5fa' }}>Dados Reais (Evidência)</strong>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Fonte: Portal de Dados Abertos - GDF<br/>Base: Manifestações da Ouvidoria 2019-2026</span>
                </div>
                <strong style={{ display: 'block', marginBottom: '8px', fontSize: '13px' }}>Legenda de Focos (Ouvidoria)</strong>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ef4444', boxShadow: '0 0 8px #ef4444' }}></div>
                  <span>Queimadas comuns e em APP (🔥)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#f97316', boxShadow: '0 0 8px #f97316' }}></div>
                  <span>Queimada em Área Pública (🔥)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#eab308', boxShadow: '0 0 8px #eab308' }}></div>
                  <span>Danos/Degradação ao Meio Ambiente (🔥)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: showHeatmap ? '12px' : '0' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#3b82f6', boxShadow: '0 0 8px #3b82f6' }}></div>
                  <span>Alagamento / Inundação (🔥)</span>
                </div>
              </>
            )}

            {showHeatmap && (
              <>
                <div style={{ marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid var(--border-glass)' }}>
                  <strong style={{ display: 'block', fontSize: '13px', color: '#60a5fa' }}>Dados Reais (Evidência)</strong>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Fonte: Defesa Civil do DF / IBGE<br/>Base: Mapeamento de Áreas de Risco do DF (SISDIA)</span>
                </div>
                <strong style={{ display: 'block', marginBottom: '8px', fontSize: '13px' }}>Riscos Climáticos API</strong>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ef4444', opacity: 0.8 }}></div>
                  <span>Alto Risco (Deslizamento / Inundação)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#f97316', opacity: 0.8 }}></div>
                  <span>Risco Médio (Alagamento / Enchente)</span>
                </div>
              </>
            )}
          </div>
        )}

      </MapContainer>

      {/* Layer Control Panel */}
      <div style={{
        position: 'absolute',
        top: 70,
        left: 24,
        background: 'var(--bg-card)',
        padding: '16px',
        borderRadius: '12px',
        border: '1px solid var(--border-glass)',
        boxShadow: 'var(--shadow-glass)',
        width: 300,
        zIndex: 9999
      }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
          {t('mapLayers')}
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {LAYERS.map(layer => {
            const isActive = activeLayers.includes(layer.id);
            return (
              <div 
                key={layer.id}
                onClick={() => toggleLayer(layer.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  background: isActive ? 'rgba(16, 185, 129, 0.1)' : 'var(--input-bg)',
                  border: `1px solid ${isActive ? 'var(--brand-primary)' : 'var(--border-glass)'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                  {layer.icon}
                  <span style={{ fontSize: '13px', fontWeight: isActive ? '600' : '400' }}>{layer.label}</span>
                </div>
                {isActive && (
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--brand-primary)' }} />
                )}
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-glass)' }}>
          <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)' }}>
            <strong>Fontes Ativas:</strong> {LAYERS.filter(l => activeLayers.includes(l.id)).map(l => l.source).join(', ') || 'Nenhuma'}
          </p>
        </div>
      </div>

      {/* Raio-X Climático Modal */}
      {selectedCity && (
        <RaioXClimatico 
          city={selectedCity} 
          onClose={() => setSelectedCity(null)} 
          activeLayers={activeLayers}
        />
      )}

      <style jsx global>{`
        .map-style-tabs {
          position: absolute;
          top: 16px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 9999;
          display: flex;
          background: rgba(0,0,0,0.6);
          border-radius: 30px;
          padding: 4px;
          border: 1px solid rgba(255,255,255,0.1);
          backdrop-filter: blur(8px);
        }

        .style-tab-btn {
          padding: 8px 16px;
          border-radius: 30px;
          font-size: 11px;
          font-weight: 700;
          color: var(--text-secondary);
          transition: all 0.3s;
          cursor: pointer;
          background: transparent;
          border: none;
        }

        .style-tab-btn.active {
          background: #3B82F6; 
          color: #fff;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
        }

        .leaflet-container { background: transparent; }
      `}</style>
    </div>
  );
}
