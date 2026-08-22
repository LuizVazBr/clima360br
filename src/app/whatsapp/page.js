"use client";
import { useState } from 'react';
import { useLang } from '@/contexts/LangContext';

export default function WhatsAppSimulation() {
  const { t, lang } = useLang();
  
  const slides = [
    {
      title: lang === 'pt' ? "Clima 360 no WhatsApp" : (lang === 'en' ? "Clima 360 on WhatsApp" : "Clima 360 en WhatsApp"),
      desc: lang === 'pt' 
        ? "Sem necessidade de baixar apps ou usar dashboards. Cidadãos de baixo letramento digital podem interagir 100% pelo WhatsApp." 
        : (lang === 'en' ? "No need to download apps or use dashboards. Low digital literacy citizens can interact 100% via WhatsApp." : "Sin necesidad de descargar aplicaciones o usar paneles. Los ciudadanos con baja alfabetización digital pueden interactuar 100% por WhatsApp."),
      chat: [
        { from: 'bot', text: 'Olá! Sou o Assistente Clima 360. Como posso ajudar você hoje no seu bairro?' },
        { from: 'user', text: 'Tem uma árvore caída e muito alagamento aqui na rua' },
        { from: 'bot', text: 'Poxa, sinto muito. Por favor, me envie uma foto ou a localização para eu registrar a ocorrência e enviar para a Defesa Civil.' }
      ]
    },
    {
      title: lang === 'pt' ? "Geolocalização Simples" : (lang === 'en' ? "Simple Geolocation" : "Geolocalización Simple"),
      desc: lang === 'pt' 
        ? "Basta enviar a localização pelo próprio recurso do WhatsApp. A API traduz para o banco de dados oficial." 
        : (lang === 'en' ? "Just send the location via WhatsApp's native feature. The API translates it to the official database." : "Simplemente envíe la ubicación mediante la función nativa de WhatsApp. La API lo traduce a la base de datos oficial."),
      chat: [
        { from: 'user', text: '📍 Localização Posição Atual' },
        { from: 'bot', text: 'Localização recebida: Vicente Pires. Isso fica em uma área mapeada de risco. A ocorrência foi registrada (Protocolo: #CLI-2591) e o TCU também foi notificado.' },
        { from: 'bot', text: 'Você ganhou +50 Clima-Points por nos ajudar! 🎉' }
      ]
    },
    {
      title: lang === 'pt' ? "Educa Clima & Acessibilidade" : (lang === 'en' ? "Educa Clima & Accessibility" : "Educa Clima y Accesibilidad"),
      desc: lang === 'pt' 
        ? "Até os cursos e gamificação podem ser feitos por áudio ou mensagens simples." 
        : (lang === 'en' ? "Even courses and gamification can be done via audio or simple messages." : "Incluso los cursos y la gamificación se pueden hacer por audio o mensajes simples."),
      chat: [
        { from: 'bot', text: 'Você tem 150 Clima-Points. Quer aprender sobre separação de resíduos para ganhar mais 30 pts?' },
        { from: 'user', text: 'Sim, quero aprender' },
        { from: 'bot', text: '▶️ Áudio (1:30) - "A separação de recicláveis..."' },
        { from: 'bot', text: 'Parabéns, curso concluído! Agora você tem 180 Clima-Points.' }
      ]
    }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  const next = () => setCurrentSlide((p) => Math.min(p + 1, slides.length - 1));
  const prev = () => setCurrentSlide((p) => Math.max(p - 1, 0));

  const slide = slides[currentSlide];

  return (
    <div style={{ minHeight: '100%', background: 'var(--bg-main)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 24px', overflowY: 'auto' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
          <span style={{color: '#25D366'}}>WhatsApp</span> API
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginTop: '8px', maxWidth: '600px' }}>
          {lang === 'pt' 
            ? "Simulação de como o cidadão interagirá com o Clima 360 sem precisar entrar no dashboard." 
            : (lang === 'en' ? "Simulation of how citizens will interact with Clima 360 without entering the dashboard." : "Simulación de cómo los ciudadanos interactuarán con Clima 360 sin ingresar al panel.")}
        </p>
      </div>

      <div style={{ display: 'flex', gap: '40px', width: '100%', maxWidth: '900px', flexWrap: 'wrap', justifyContent: 'center' }}>
        
        {/* Slide Info */}
        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ background: 'rgba(37, 211, 102, 0.1)', color: '#25D366', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', alignSelf: 'flex-start', marginBottom: '16px' }}>
            {lang === 'pt' ? `Funcionalidade ${currentSlide + 1} de ${slides.length}` : (lang === 'en' ? `Feature ${currentSlide + 1} of ${slides.length}` : `Característica ${currentSlide + 1} de ${slides.length}`)}
          </div>
          <h2 style={{ fontSize: '24px', margin: '0 0 16px 0', color: 'var(--text-primary)' }}>{slide.title}</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '15px' }}>{slide.desc}</p>
          
          <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
            <button onClick={prev} disabled={currentSlide === 0} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid var(--border-glass)', background: 'var(--bg-card)', color: currentSlide === 0 ? 'var(--text-muted)' : 'var(--text-primary)', cursor: currentSlide === 0 ? 'not-allowed' : 'pointer' }}>
              {lang === 'pt' ? 'Anterior' : (lang === 'en' ? 'Previous' : 'Anterior')}
            </button>
            <button onClick={next} disabled={currentSlide === slides.length - 1} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: currentSlide === slides.length - 1 ? 'var(--border-glass)' : '#25D366', color: currentSlide === slides.length - 1 ? 'var(--text-muted)' : '#fff', cursor: currentSlide === slides.length - 1 ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>
              {lang === 'pt' ? 'Próximo' : (lang === 'en' ? 'Next' : 'Siguiente')}
            </button>
          </div>
        </div>

        {/* WhatsApp Mock */}
        <div style={{ width: '320px', height: '560px', background: '#ece5dd', borderRadius: '30px', border: '8px solid #333', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
          <div style={{ background: '#075e54', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', color: '#fff' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🤖</div>
            <div style={{ fontWeight: 'bold', fontSize: '15px' }}>Clima 360 Bot</div>
          </div>
          
          <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' }}>
            {slide.chat.map((msg, i) => (
              <div key={i} style={{ 
                maxWidth: '85%', 
                padding: '10px 14px', 
                borderRadius: '12px', 
                fontSize: '14px', 
                lineHeight: '1.4',
                alignSelf: msg.from === 'user' ? 'flex-end' : 'flex-start',
                background: msg.from === 'user' ? '#dcf8c6' : '#fff',
                color: '#303030',
                borderBottomRightRadius: msg.from === 'user' ? '4px' : '12px',
                borderBottomLeftRadius: msg.from === 'bot' ? '4px' : '12px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }}>
                {msg.text}
              </div>
            ))}
          </div>
          
          <div style={{ background: '#f0f0f0', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ flex: 1, background: '#fff', borderRadius: '20px', padding: '10px 16px', color: '#999', fontSize: '14px' }}>
              Mensagem...
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#128c7e', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
              ▶
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
