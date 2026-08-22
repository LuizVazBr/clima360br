"use client";
import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Camera, Send } from 'lucide-react';

const STEPS = [
  { icon: '📸', label: 'Analisando imagem e áudio/texto...' },
  { icon: '📍', label: 'Identificando localização GPS...' },
  { icon: '🤖', label: 'IA classificando ocorrência...' },
  { icon: '📩', label: 'Enviando cobrança para a Ouvidoria DF...' },
  { icon: '✅', label: 'Cobrança registrada com sucesso!' },
];

export default function CobrarSimulator() {
  const [step, setStep] = useState(0); // 0=idle, 1-5=running, 6=done
  const [running, setRunning] = useState(false);
  const [actions, setActions] = useState([]);
  
  // Input states
  const [textInput, setTextInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  const start = () => {
    if (isListening) stopListen();
    setRunning(true);
    setStep(1);
    setActions([]);
    let s = 1;
    const run = async () => {
      if (s > STEPS.length) {
        setRunning(false);
        setStep(6);
        setActions([
          `📝 Relato: "${textInput || 'Sem descrição (análise apenas por imagem)'}"`,
          '🚨 Problema detectado — Coordenadas: -15.801, -48.026 (Vicente Pires)',
          '📧 Protocolo #CLI-2025-00847 criado na Ouvidoria DF',
          '🏛️ Enviado automaticamente ao TCU para fiscalização',
          '💰 +50 pontos ESG adicionados ao seu perfil',
        ]);
        
        // Registrar real na API
        try {
          await fetch('/api/ouvidoria', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              assunto_nome: textInput.toLowerCase().includes('fogo') ? 'Queimada' : 'Alagamento',
              bairro: 'Vicente Pires',
              descricao: textInput,
              latitude: -15.801,
              longitude: -48.026
            })
          });
          // Disparar evento para o mapa atualizar
          window.dispatchEvent(new Event('refreshMap'));
        } catch(e) {
          console.error(e);
        }

        return;
      }
      setStep(s);
      s++;
      setTimeout(run, 900);
    };
    setTimeout(run, 500);
  };

  const startListen = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Reconhecimento de voz não suportado neste navegador.');
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = 'pt-BR';
    rec.interimResults = true;
    rec.onstart = () => setIsListening(true);
    rec.onend = () => setIsListening(false);
    rec.onresult = (e) => {
      let finalTranscript = '';
      for (let i = e.resultIndex; i < e.results.length; ++i) {
        if (e.results[i].isFinal) {
          finalTranscript += e.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        setTextInput(prev => (prev ? prev + ' ' : '') + finalTranscript);
      }
    };
    recognitionRef.current = rec;
    rec.start();
  };

  const stopListen = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const reset = () => { 
    setStep(0); 
    setRunning(false); 
    setActions([]); 
    setTextInput('');
  };

  return (
    <div style={{ color: 'var(--text-primary)', background: 'var(--bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-glass)', boxShadow: 'var(--shadow-glass)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>📸 Cobrar o Governo</h2>
        <button
          onClick={() => { 
            const modal = document.getElementById('cobrar-modal');
            if (modal) modal.style.display = 'none';
            else window.location.href = '/';
            reset(); 
          }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '20px' }}>✕</button>
      </div>

      {step === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ color: 'var(--text-secondary)', margin: '0', fontSize: '14px', lineHeight: '1.5' }}>
            Descreva o problema climático (alagamento, incêndio, erosão) para a IA ou anexe uma foto. 
          </p>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
            <textarea 
              value={textInput}
              onChange={e => setTextInput(e.target.value)}
              placeholder="Ex: A rua principal está totalmente alagada e a boca de lobo está entupida..."
              style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid var(--border-glass)', background: 'var(--input-bg)', color: 'var(--text-primary)', resize: 'none', height: '100px', fontSize: '14px' }}
            />
            <button 
              onClick={isListening ? stopListen : startListen}
              style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid ' + (isListening ? 'rgba(239,68,68,0.5)' : 'var(--border-glass)'), background: isListening ? 'rgba(239,68,68,0.2)' : 'var(--input-bg)', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0 }}
            >
              {isListening ? <MicOff size={20} color="#ef4444" /> : <Mic size={20} color="#3b82f6" />}
            </button>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', background: 'var(--input-bg)', color: 'var(--text-primary)', border: '1px solid var(--border-glass)', borderRadius: '12px', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>
              <Camera size={18} /> Tirar Foto
            </button>
            <button 
              onClick={start} 
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', background: 'linear-gradient(135deg, #3B82F6, #10B981)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '14px', cursor: 'pointer' }}
            >
              <Send size={18} /> Enviar / Cobrar
            </button>
          </div>

          <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px dashed rgba(245,158,11,0.3)', borderRadius: '8px', padding: '10px 16px', fontSize: '13px', color: '#F59E0B', fontWeight: '700', textAlign: 'center' }}>
            +50 pontos ESG ao registrar a ocorrência
          </div>
        </div>
      )}

      {step > 0 && step <= STEPS.length && (
        <div style={{ padding: '8px 0' }}>
          {STEPS.slice(0, step).map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '8px', background: i === step - 1 ? 'rgba(59,130,246,0.1)' : 'rgba(0,0,0,0.05)', marginBottom: '8px', transition: 'all 0.3s' }}>
              <span style={{ fontSize: '24px' }}>{i === step - 1 && running ? '⏳' : s.icon}</span>
              <span style={{ fontSize: '13px', fontWeight: '600', color: i < step - 1 ? 'var(--text-muted)' : 'var(--text-primary)' }}>{s.label}</span>
              {i < step - 1 && <span style={{ marginLeft: 'auto', color: '#10B981' }}>✔️</span>}
            </div>
          ))}
        </div>
      )}

      {step === 6 && (
        <div>
          <div style={{ textAlign: 'center', padding: '16px 0 20px' }}>
            <div style={{ fontSize: '48px' }}>🎉</div>
            <h3 style={{ color: '#10B981', fontWeight: '800', margin: '8px 0' }}>Cobrança enviada com sucesso!</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
            {actions.map((a, i) => (
              <div key={i} style={{ padding: '10px 14px', background: 'rgba(0,0,0,0.1)', borderRadius: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>{a}</div>
            ))}
          </div>
          <button onClick={reset} style={{ width: '100%', padding: '12px', background: 'rgba(59,130,246,0.15)', color: '#3B82F6', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}>
            Registrar outra ocorrência
          </button>
        </div>
      )}
    </div>
  );
}
