"use client";

import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, ChevronDown, ChevronUp, FilePlus2, Volume2, Square } from 'lucide-react';
import Link from 'next/link';

const TOPICS = [
  { id: 1, icon: '🌡️', title: 'Como está o DF climaticamente?', answer: 'O Distrito Federal avançou 57% no eixo de Políticas Públicas e 44% em Governança Climática em 2025, segundo o Painel ClimaBrasil do TCU. A Defesa Civil mapeou 14 áreas de alto risco, como Vicente Pires e Sol Nascente. O DF ainda precisa de avanço em Financiamento Climático, com apenas 25% de progresso.' },
  { id: 2, icon: '📢', title: 'Como cobrar ações do governo?', answer: 'Você pode: 1) Registrar ocorrência no 156 (Ouvidoria do DF), 2) Usar o Clima 360 para fotografar e geolocalizar o problema, 3) Acompanhar pelo portal da transparência se os fundos estão sendo aplicados, 4) Cobrar o TCU pelo canal de demandas da sociedade. Cada registro no Clima 360 gera +50 pontos ESG para você.' },
  { id: 3, icon: '🚧', title: 'Quais ações estão sendo realizadas no DF?', answer: 'O DF possui: Programa Reflorestar DF, Protocolo de Ações do Período Chuvoso (Defesa Civil), mapeamento contínuo de áreas de risco pela SUDEC com 103 vistorias em 2024, além do Plano de Prevenção a Eventos Climáticos em elaboração para 2025. Mas o financiamento ainda está aquém do necessário.' },
  { id: 4, icon: '📊', title: 'O que são os Eixos do Painel Clima?', answer: 'O Painel ClimaBrasil avalia 3 eixos: Governança Climática — se o governo tem estrutura e planos para o clima; Políticas Públicas — se as ações chegam na prática; Financiamento Climático — se há dinheiro sendo investido. O DF tem nota intermediária em 2 eixos e inicial em Financiamento.' },
  { id: 5, icon: '♻️', title: 'Como ganhar pontos ESG como cidadão?', answer: 'No Clima 360 você ganha pontos ESG ao: fotografar e reportar alagamentos ou incêndios (+50pts cada), completar cursos de educação climática (+30pts cada), ter cobranças resolvidas pelo TCU (+100pts). Esses pontos viram descontos em parceiros como Drogasil, farmácias e mercados locais.' },
  { id: 6, icon: '🌍', title: 'O que é ESG para mim, cidadão?', answer: 'ESG significa Environmental, Social e Governance — ou seja, práticas ambientais, sociais e de governança. Para você como cidadão, ESG significa: reduzir seu impacto ambiental, cobrar empresas e governo que causam danos, e ser recompensado por isso. No Clima 360, suas ações viram pontos e descontos reais.' },
];

export default function TotemPage() {
  const [active, setActive] = useState(null);
  const [speaking, setSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [listening, setListening] = useState(false);
  const [voices, setVoices] = useState([]);
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
      const loadVoices = () => {
        setVoices(synthRef.current.getVoices());
      };
      loadVoices();
      if (synthRef.current.onvoiceschanged !== undefined) {
        synthRef.current.onvoiceschanged = loadVoices;
      }
    }
    return () => {
      if (synthRef.current) synthRef.current.cancel();
    };
  }, []);

  const speak = (text) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    
     // Select best PT-BR voice, strictly avoiding Google if possible to get a better Windows native voice
    let bestVoice = voices.find(v => (v.name.includes('Francisca') || v.name.includes('Online (Natural)')) && v.lang.includes('pt-BR'));
    if (!bestVoice) bestVoice = voices.find(v => v.name.includes('Microsoft') && v.name.includes('Maria') && v.lang.includes('pt-BR'));
    if (!bestVoice) bestVoice = voices.find(v => v.name.includes('Microsoft') && v.lang.includes('pt-BR'));
    if (!bestVoice) bestVoice = voices.find(v => v.lang.includes('pt') && !v.name.toLowerCase().includes('google'));
    if (!bestVoice) bestVoice = voices.find(v => v.lang.includes('pt'));
    
    if (bestVoice) {
      utter.voice = bestVoice;
    }
    
    utter.lang = 'pt-BR';
    utter.rate = 1.0; 
    utter.pitch = 1.1; // slightly higher pitch to sound more female if fallback hits
    
    utter.onstart = () => setSpeaking(true);
    utter.onend = () => setSpeaking(false);
    synthRef.current.speak(utter);
  };

  const handleTopic = (topic) => {
    if (active?.id === topic.id) {
      setActive(null);
      stopSpeak();
    } else {
      setActive(topic);
      speak(topic.answer);
    }
  };

  const stopSpeak = () => {
    if (synthRef.current) synthRef.current.cancel();
    setSpeaking(false);
  };

  const startListen = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Reconhecimento de voz não suportado neste navegador.');
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = 'pt-BR';
    rec.interimResults = false;
    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onresult = async (e) => {
      const said = e.results[0][0].transcript;
      setTranscript(said);
      
      // Remove any existing active topic to show the AI response cleanly
      setActive(null);
      
      const tempAiTopic = { id: 99, icon: '🤖', title: 'Consultando Dados e IA...', answer: 'Aguarde um momento...' };
      setActive(tempAiTopic);
      
      try {
        const res = await fetch('/api/totem-ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: said })
        });
        const data = await res.json();
        
        const aiTopic = { id: 99, icon: '🤖', title: data.title, answer: data.answer };
        setActive(aiTopic);
        speak(data.answer);
      } catch (err) {
        console.error(err);
        const fallback = 'Desculpe, tive um problema ao buscar os dados em tempo real. Tente perguntar sobre as camadas climáticas listadas abaixo.';
        const errTopic = { id: 99, icon: '⚠️', title: 'Erro de Conexão', answer: fallback };
        setActive(errTopic);
        speak(fallback);
      }
    };
    recognitionRef.current = rec;
    rec.start();
  };

  const stopListen = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  return (
    <div style={{ height: '100vh', width: '100vw', background: 'var(--bg-main)', overflowY: 'scroll' }}>
      <div style={{ maxWidth: '800px', margin: '0', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '60px 40px', minHeight: '100%' }}>
      
        {/* TOP ACTIONS */}
        <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
          <Link href="/cobrar" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            background: 'var(--brand-primary)', 
            color: 'white', 
            padding: '10px 20px', 
            borderRadius: '8px', 
            textDecoration: 'none', 
            fontWeight: 'bold',
            boxShadow: '0 4px 12px rgba(16,185,129,0.3)'
          }}>
            <FilePlus2 size={18} /> Cobrar o Governo
          </Link>
        </div>

        {/* HEADER */}
        <div style={{ textAlign: 'left', marginBottom: '32px', width: '100%' }}>
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>🌿</div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>Totem Clima 360</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '8px', maxWidth: '600px' }}>Pergunte por voz ou toque em um tema para saber mais sobre políticas climáticas e dados reais do DF.</p>
        </div>

        {/* MIC */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <button
            onClick={listening ? stopListen : startListen}
            style={{ width: '80px', height: '80px', flexShrink: 0, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', border: 'none', cursor: 'pointer', transition: 'all 0.3s', background: listening ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.15)', boxShadow: listening ? '0 0 32px rgba(239,68,68,0.5)' : '0 0 20px rgba(16,185,129,0.3)' }}
          >
            {listening ? <MicOff size={32} color="#ef4444" /> : <Mic size={32} color="#10B981" />}
          </button>
          
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {listening && (
              <p style={{ color: '#10B981', fontWeight: 'bold', margin: '0 0 4px 0', animation: 'pulse 1s infinite' }}>Ouvindo... fale seu tema</p>
            )}
            {!listening && !transcript && (
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>Toque no microfone para perguntar por voz</p>
            )}
            {transcript && (
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0, fontStyle: 'italic' }}>"{transcript}"</p>
            )}
          </div>
        </div>

        {/* AI ANSWER CARD (Se for retorno de IA) */}
        {active && active.id === 99 && (
          <div style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: '16px', padding: '24px', marginBottom: '32px', boxShadow: '0 4px 20px rgba(16, 185, 129, 0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <span style={{ fontSize: '28px' }}>{active.icon}</span>
              <h2 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--text-primary)', margin: 0, flex: 1, textAlign: 'left' }}>{active.title}</h2>
              {speaking ? (
                <button onClick={stopSpeak} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: 'none', borderRadius: '8px', padding: '6px 14px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}><Square size={14} /> Parar</button>
              ) : (
                <button onClick={() => speak(active.answer)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(16,185,129,0.15)', color: '#10B981', border: 'none', borderRadius: '8px', padding: '6px 14px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}><Volume2 size={14} /> Ouvir</button>
              )}
            </div>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', fontSize: '14px', margin: 0, textAlign: 'left' }}>{active.answer}</p>
          </div>
        )}

        {/* TOPICS LIST (Accordion style) */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px', paddingBottom: '40px' }}>
          <p style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px', textAlign: 'left' }}>Toque para saber mais</p>
          
          {TOPICS.map(topic => {
            const isActive = active?.id === topic.id;
            return (
              <div
                key={topic.id}
                style={{ background: isActive ? 'rgba(16,185,129,0.05)' : 'var(--bg-card)', border: `1px solid ${isActive ? '#10B981' : 'var(--border-glass)'}`, borderRadius: '12px', overflow: 'hidden', transition: 'all 0.2s' }}
              >
                {/* Header (Clickable) */}
                <div 
                  onClick={() => handleTopic(topic)}
                  style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }}
                >
                  <span style={{ fontSize: '24px' }}>{topic.icon}</span>
                  <span style={{ flex: 1, fontWeight: '600', color: 'var(--text-primary)', fontSize: '14px', textAlign: 'left' }}>{topic.title}</span>
                  {isActive ? <ChevronUp size={18} color="#10B981" /> : <ChevronDown size={18} color="var(--text-muted)" />}
                </div>

                {/* Body (Expanded) */}
                {isActive && (
                  <div style={{ padding: '0 20px 20px 20px', borderTop: '1px dashed var(--border-glass)' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '12px', marginBottom: '8px' }}>
                      {speaking ? (
                        <button onClick={stopSpeak} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}><Square size={12} /> Parar Áudio</button>
                      ) : (
                        <button onClick={() => speak(topic.answer)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(16,185,129,0.1)', color: '#10B981', border: 'none', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}><Volume2 size={12} /> Ouvir Áudio</button>
                      )}
                    </div>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '14px', margin: 0, textAlign: 'left' }}>{topic.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      <style jsx global>{`
        ::-webkit-scrollbar {
          width: 10px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
          border-left: 1px solid var(--border-glass);
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(16, 185, 129, 0.4);
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(16, 185, 129, 0.7);
        }
      `}</style>
    </div>
  );
}
