"use client";

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import { Camera, X } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Criando Ícones Customizados Bonitos via HTML/CSS
const createCustomIcon = (color, glowColor, isCamera) => {
  if (isCamera) {
    return new L.divIcon({
      className: 'custom-pin-wrapper',
      html: `
        <div style="filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.8));">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#3B82F6" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      popupAnchor: [0, -12],
    });
  }

  return new L.divIcon({
    className: 'custom-pin-wrapper',
    html: `
      <div class="custom-pin" style="background-color: ${color}; box-shadow: 0 0 15px ${glowColor}; border: 2px solid #fff;">
        <div class="pin-pulse" style="background-color: ${color};"></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

const iconEcoponto = createCustomIcon('#10B981', 'rgba(16, 185, 129, 0.6)', false); // Verde
const iconGerador = createCustomIcon('#F59E0B', 'rgba(245, 158, 11, 0.6)', false); // Laranja
const iconCamera = createCustomIcon('#3B82F6', 'rgba(59, 130, 246, 0.6)', true); // Azul (Câmera IoT)

const MAP_STYLES = [
  { id: 'satellite', name: 'Satélite', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', sub: 'abc' },
  { id: 'hybrid', name: 'Híbrido', url: 'https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', sub: ['mt0','mt1','mt2','mt3'] },
  { id: 'light', name: 'Light', url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', sub: 'abc' },
  { id: 'dark', name: 'Dark', url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', sub: 'abc' },
];

const heatPoints = [
  [-22.1065, -56.5283],
  [-22.1075, -56.5263],
  [-22.1055, -56.5273],
  [-22.1085, -56.5223],
  [-22.1045, -56.5303],
  [-22.1100, -56.5200],
  [-22.1090, -56.5190],
];

export default function DigitalTwinMap({ showHeatmap = false }) {
  const bBelaVista = [-22.1065, -56.5283];
  
  // Na imagem, o active está no 'Dark'
  const [activeStyle, setActiveStyle] = useState(3);
  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      
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
        center={bBelaVista} 
        zoom={14} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          url={MAP_STYLES[activeStyle].url}
          subdomains={MAP_STYLES[activeStyle].sub}
        />
        
        <Marker position={bBelaVista} icon={iconEcoponto}>
          <Popup className="custom-popup">
            <strong>Ecoponto Central</strong><br/>
            Status: Virdia Hub Ativo<br/>
            Capacidade: 75%
          </Popup>
        </Marker>

        <Marker position={[-22.1100, -56.5200]} icon={iconGerador}>
          <Popup className="custom-popup">
            <strong>Supermercado Y</strong><br/>
            Grande Gerador<br/>
            Alerta: Papelão Acumulado
          </Popup>
        </Marker>

        {/* Novo Marcador de Câmera IoT - Foco no Grande Gerador */}
        <Marker 
          position={[-22.1090, -56.5210]} 
          icon={iconCamera}
          eventHandlers={{
            click: () => setCameraModalOpen(true)
          }}
        >
          <Popup className="custom-popup">
            <strong>Câmera IoT - Supermercado Y</strong><br/>
            Monitoramento de Grande Gerador<br/>
            <span style={{color: '#3B82F6'}}>Clique no pino para abrir o Feed</span>
          </Popup>
        </Marker>

        {/* Renderização do Heatmap Simulado */}
        {showHeatmap && heatPoints.map((pt, idx) => (
          <CircleMarker 
            key={idx}
            center={pt}
            radius={20}
            pathOptions={{
              color: 'transparent',
              fillColor: '#EF4444',
              fillOpacity: 0.4,
            }}
          />
        ))}
      </MapContainer>

      {/* Modal da Câmera (Renderizado no Portal para evitar z-index issues) */}
      {mounted && cameraModalOpen && createPortal(
        <div className="camera-modal-overlay fade-in" onClick={() => setCameraModalOpen(false)}>
          <div className="camera-modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                <Camera size={20} color="#3B82F6"/>
                <h3 style={{margin: 0, color: 'white', fontSize: '16px'}}>Feed IoT: Supermercado Y (Grande Gerador)</h3>
              </div>
              <button className="close-btn" onClick={() => setCameraModalOpen(false)}><X size={20}/></button>
            </div>
            
            <div className="simulated-feed">
              <div className="scan-line"></div>
              
              {/* Caixas de IA de Alta Precisão */}
              <div className="bounding-box precise b-pet">
                <span className="b-label">PET [99.8%]</span>
                <div className="crosshair top-left"></div><div className="crosshair top-right"></div>
                <div className="crosshair bottom-left"></div><div className="crosshair bottom-right"></div>
              </div>
              <div className="bounding-box precise b-org">
                <span className="b-label org">ORG [87.4%]</span>
                <div className="crosshair top-left org-c"></div><div className="crosshair top-right org-c"></div>
                <div className="crosshair bottom-left org-c"></div><div className="crosshair bottom-right org-c"></div>
              </div>
              <div className="bounding-box precise b-papel">
                <span className="b-label">PAPELÃO [95.2%]</span>
                <div className="crosshair top-left"></div><div className="crosshair top-right"></div>
                <div className="crosshair bottom-left"></div><div className="crosshair bottom-right"></div>
              </div>

              <div className="overlay-info">
                <span>REC • LIVE | IA MODEL: v4.2</span>
                <span>Análise de Resíduos (Gerador)</span>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
      
      <style jsx global>{`
        .map-style-tabs {
          position: absolute;
          top: 16px;
          left: 24px;
          z-index: 1000;
          display: flex;
          background: rgba(0,0,0,0.4);
          border-radius: 30px;
          padding: 4px;
          border: 1px solid rgba(255,255,255,0.05);
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

        .custom-pin-wrapper { display: flex; align-items: center; justify-content: center; }
        .custom-pin {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          position: relative;
          z-index: 2;
        }
        .pin-pulse {
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: 100%; height: 100%;
          border-radius: 50%;
          animation: mapPinPulse 2s infinite ease-out;
          z-index: 1;
        }
        @keyframes mapPinPulse {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
          100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; }
        }

        .leaflet-container { background: transparent; }
        .leaflet-popup-content-wrapper {
          background: rgba(19, 27, 36, 0.9);
          color: #F3F4F6;
          border: 1px solid rgba(16, 185, 129, 0.5);
          backdrop-filter: blur(8px);
          border-radius: 12px;
        }
        .leaflet-popup-tip { background: rgba(19, 27, 36, 0.9); }

        /* Modal da Câmera IoT */
        .camera-modal-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.8);
          backdrop-filter: blur(8px);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .camera-modal-content {
          width: 700px;
          background: #0B0C10;
          border: 1px solid rgba(59, 130, 246, 0.5);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 0 40px rgba(59, 130, 246, 0.15);
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          padding: 16px;
          background: rgba(255,255,255,0.05);
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .close-btn { background: transparent; border: none; color: white; cursor: pointer; }
        
        .simulated-feed {
          position: relative;
          width: 100%;
          height: 400px;
          background: url('/camera_feed.jpg') center/cover;
        }
        
        .scan-line {
          position: absolute; top: 0; left: 0; width: 100%; height: 1px; background: #10B981;
          box-shadow: 0 0 15px 2px #10B981;
          animation: mapScan 2s linear infinite;
          z-index: 10;
        }

        .bounding-box.precise {
          position: absolute;
          border: 1px solid rgba(16, 185, 129, 0.8);
          background: rgba(16, 185, 129, 0.1);
        }
        .b-pet { top: 72%; left: 32%; width: 50px; height: 110px; }
        .b-org { top: 82%; left: 55%; width: 90px; height: 50px; border-color: rgba(239,68,68,0.8); background: rgba(239,68,68,0.1); }
        .b-papel { top: 68%; left: 62%; width: 140px; height: 95px; }

        .crosshair { position: absolute; width: 8px; height: 8px; border: 2px solid #10B981; }
        .crosshair.top-left { top: -2px; left: -2px; border-bottom: none; border-right: none; }
        .crosshair.top-right { top: -2px; right: -2px; border-bottom: none; border-left: none; }
        .crosshair.bottom-left { bottom: -2px; left: -2px; border-top: none; border-right: none; }
        .crosshair.bottom-right { bottom: -2px; right: -2px; border-top: none; border-left: none; }

        .crosshair.org-c { border-color: #EF4444; }

        .b-label {
          position: absolute; top: -16px; left: -1px;
          background: rgba(16, 185, 129, 0.9); color: white; font-size: 10px; font-weight: bold; padding: 2px 4px;
          font-family: monospace; backdrop-filter: blur(2px);
        }
        .b-label.org { background: rgba(239, 68, 68, 0.9); }

        .overlay-info {
          position: absolute; top: 16px; left: 16px; right: 16px;
          display: flex; justify-content: space-between;
          color: white; font-size: 12px; font-weight: bold; font-family: monospace;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
        }

        .fade-in { animation: fadeIn 0.3s ease-out; }
        @keyframes mapScan { 0% { top: 0; opacity: 1; } 95% { top: 100%; opacity: 1; } 100% { top: 100%; opacity: 0; } }
      `}</style>
    </div>
  );
}
