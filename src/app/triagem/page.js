"use client";
import { useState, useEffect, useRef } from 'react';
import { Camera, RefreshCw, Layers, CheckCircle } from 'lucide-react';

export default function TriagemInteligentePage() {
  const [isScanning, setIsScanning] = useState(false);
  const [data, setData] = useState([]);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [scannedResult, setScannedResult] = useState(null);

  const fetchTriagem = async () => {
    try {
      const res = await fetch('/api/triagem');
      const json = await res.json();
      setData(json);
    } catch(e) {}
  };

  useEffect(() => { fetchTriagem(); }, []);

  const startCamera = async () => {
    // Para fins de demonstração da plataforma, usamos um vídeo simulando a esteira de triagem
    // em vez de pedir acesso à webcam do usuário.
    setIsCameraActive(true);
  };

  const stopCamera = () => {
    setIsCameraActive(false);
  };

  const handleScan = async () => {
    if(!isCameraActive) await startCamera();
    
    setIsScanning(true);
    setScannedResult(null);

    // Simula o tempo de inferência do modelo de IA (2 segundos) enquanto o CSS anima a linha de scan
    await new Promise(r => setTimeout(r, 2000));
    
    // Gera mock de inferência
    const mockInference = [
      { material: "PET Claro", confianca: "98.5%" },
      { material: "Papelão", confianca: "92.1%" }
    ];
    setScannedResult(mockInference);
    setIsScanning(false);

    try {
      // Salva no banco de dados real simulando que a API de visão computacional mandou
      await fetch('/api/triagem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ material: "PET Claro e Papelão (Visão)", peso: 1.5 })
      });
      fetchTriagem();
    } catch(e) {}
  };

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title text-gradient">Triagem Inteligente (CV)</h1>
          <p className="page-subtitle">Identificação automatizada de recicláveis por Visão Computacional</p>
        </div>
        <button 
          className={`btn-camera ${isCameraActive ? 'active' : ''}`} 
          onClick={isCameraActive ? stopCamera : startCamera}
        >
          <Camera size={18} /> {isCameraActive ? 'Desativar Câmera' : 'Ativar Câmera da Esteira'}
        </button>
      </div>

      <div className="layout-grid">
        {/* Painel Esquerdo: Câmera */}
        <div className="camera-panel glass-panel">
          <div className="camera-header">
            <h3>Feed Principal - Câmera Esteira 01</h3>
            <span className={`status-dot ${isCameraActive ? 'online' : 'offline'}`}></span>
          </div>
          
          <div className="video-container">
            {!isCameraActive ? (
              <div className="camera-placeholder">
                <Camera size={48} color="#4B5563" />
                <p>Câmera desativada.</p>
              </div>
            ) : (
              <>
                <video 
                  src="https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4" 
                  autoPlay 
                  loop 
                  muted 
                  playsInline 
                  className="video-feed" 
                  style={{ filter: 'grayscale(30%) sepia(20%) hue-rotate(180deg) brightness(0.8)' }}
                ></video>
                {isScanning && <div className="scanner-line"></div>}
                {scannedResult && (
                  <div className="bounding-boxes fade-in">
                    <div className="box box-1"><span className="label">PET (98%)</span></div>
                    <div className="box box-2"><span className="label">Papelão (92%)</span></div>
                  </div>
                )}
              </>
            )}
          </div>

          <button className="btn-analyze" onClick={handleScan} disabled={isScanning || !isCameraActive}>
            {isScanning ? <><RefreshCw size={18} className="spin" /> Processando Imagem (IA)...</> : <><Layers size={18} /> Analisar Quadro Atual</>}
          </button>
        </div>

        {/* Painel Direito: Resultados e Banco de Dados */}
        <div className="data-panel glass-panel">
          <h3>Registros da Triagem (Real-time DB)</h3>
          
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr><th>ID Lote</th><th>Material Identificado</th><th>Estimativa de Peso</th><th>Data/Hora</th></tr>
              </thead>
              <tbody>
                {data.map(item => (
                  <tr key={item.id}>
                    <td>#{item.id}</td>
                    <td className="bold text-blue"><CheckCircle size={14} className="inline-icon text-green"/> {item.material}</td>
                    <td>{item.peso} kg</td>
                    <td className="text-muted">{new Date(item.criado_em).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style jsx>{`
        .page-container { padding: 40px; height: 100%; display: flex; flex-direction: column; gap: 24px; overflow-y: auto; }
        .page-header { display: flex; justify-content: space-between; align-items: flex-end; }
        .page-title { font-family: var(--font-outfit); font-size: 32px; font-weight: 800; margin-bottom: 8px; }
        .page-subtitle { color: var(--text-secondary); font-size: 14px; }
        
        .btn-camera { display: flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.2); color: var(--text-primary); padding: 10px 20px; border: 1px solid var(--border-glass); border-radius: 8px; font-weight: 600; cursor:pointer; transition: 0.2s; }
        .btn-camera:hover { background: rgba(255,255,255,0.05); }
        .btn-camera.active { border-color: #10B981; color: #10B981; }

        .layout-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; flex: 1; min-height: 0; }
        
        .camera-panel { display: flex; flex-direction: column; gap: 16px; padding: 24px; border-radius: 16px; background: var(--bg-card); border: 1px solid var(--border-glass); }
        .camera-header { display: flex; justify-content: space-between; align-items: center; }
        .camera-header h3 { font-size: 16px; color: var(--text-primary); margin: 0; }
        .status-dot { width: 12px; height: 12px; border-radius: 50%; }
        .status-dot.online { background: #10B981; box-shadow: 0 0 8px #10B981; }
        .status-dot.offline { background: #EF4444; }

        .video-container { position: relative; width: 100%; aspect-ratio: 4/3; background: #000; border-radius: 12px; overflow: hidden; border: 1px solid var(--border-glass); display: flex; align-items: center; justify-content: center;}
        .video-feed { width: 100%; height: 100%; object-fit: cover; }
        .camera-placeholder { display: flex; flex-direction: column; align-items: center; color: var(--text-muted); font-size: 14px; gap: 12px;}
        
        .scanner-line {
          position: absolute; top: 0; left: 0; width: 100%; height: 4px; background: #3B82F6; box-shadow: 0 0 15px 2px #3B82F6;
          animation: scan 2s linear infinite; z-index: 10;
        }

        .bounding-boxes { position: absolute; inset: 0; pointer-events: none; }
        .box { position: absolute; border: 2px solid #10B981; background: rgba(16, 185, 129, 0.2); display: flex; justify-content: center; align-items: flex-start; }
        .box-1 { top: 20%; left: 30%; width: 120px; height: 180px; }
        .box-2 { top: 40%; left: 60%; width: 100px; height: 100px; border-color: #F59E0B; background: rgba(245, 158, 11, 0.2); }
        .box .label { background: #10B981; color: #fff; font-size: 10px; font-weight: bold; padding: 2px 6px; border-bottom-left-radius: 4px; border-bottom-right-radius: 4px; margin-top: -2px; }
        .box-2 .label { background: #F59E0B; }

        .btn-analyze { display: flex; align-items: center; justify-content: center; gap: 8px; background: #3B82F6; color: #fff; padding: 14px; border-radius: 8px; font-weight: 700; font-size: 16px; border: none; cursor:pointer; transition: 0.2s; margin-top: auto; }
        .btn-analyze:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-analyze:hover:not(:disabled) { background: #2563EB; }
        
        .data-panel { display: flex; flex-direction: column; gap: 16px; padding: 24px; border-radius: 16px; background: var(--bg-card); border: 1px solid var(--border-glass); }
        .data-panel h3 { font-size: 16px; color: var(--text-primary); margin: 0; }
        
        .table-wrapper { flex: 1; overflow-y: auto; }
        .data-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 13px; }
        .data-table th, .data-table td { padding: 12px 16px; border-bottom: 1px solid var(--border-glass); }
        .data-table th { text-transform: uppercase; color: var(--text-muted); font-size: 11px; font-weight: 700; background: rgba(0,0,0,0.1); }
        .bold { font-weight: 700; }
        .text-blue { color: #60A5FA; }
        .text-muted { color: var(--text-muted); }
        .inline-icon { display: inline-block; vertical-align: middle; margin-right: 4px; }
        
        .spin { animation: spin 1s linear infinite; }
        .fade-in { animation: fadeIn 0.4s ease-out; }
        @keyframes scan { 0% { top: 0; opacity: 1; } 95% { top: 100%; opacity: 1; } 100% { top: 100%; opacity: 0; } }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}