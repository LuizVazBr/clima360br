"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Sun, Bell, User, Menu, Bot,
  Activity, Truck, Users, ScanEye, BookOpen, Brain, Store, FilePlus2, X, MapPin, Database, Monitor, FileCode2
} from 'lucide-react';

import { useRole } from '@/hooks/useRole';
import { useLang } from '@/contexts/LangContext';

export default function Topbar() {
  const { lang, setLang, t } = useLang();
  const [time, setTime] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [role, setRole] = useRole();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAssistant, setShowAssistant] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  
  const getChatIntro = (r) => {
    switch(r) {
      case 'cidadao': return 'Olá! Sou o assistente Clima 360. Posso ajudar você a entender políticas públicas, relatar problemas como focos de calor ou alagamentos, e acessar gamificação (Educa Clima 360).';
      case 'tcu': return 'Olá! Sou o assistente Clima 360. Posso auxiliar com demandas e reclamações diretas da sociedade.';
      case 'auditor': return 'Olá! Sou o assistente Clima 360. Posso auxiliar auditores buscando fontes oficiais, portal da transparência, e otimizando a fiscalização climática.';
      case 'gestor': default: return 'Olá! Sou o assistente Clima 360. Posso auxiliar na análise de investimentos climáticos, status de ações do município e vulnerabilidades.';
    }
  };

  // Chatbot State
  const [chatInput, setChatInput] = useState('');
  const chatInputRef = useRef('');
  const [messages, setMessages] = useState([
    { role: 'assistant', text: getChatIntro('gestor'), time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }
  ]);
  const messagesEndRef = useRef(null);

  // Update intro when role changes
  useEffect(() => {
    if (messages.length === 1 && messages[0].role === 'assistant') {
      setMessages([{ role: 'assistant', text: getChatIntro(role), time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }]);
    }
  }, [role]);

  const [micState, setMicState] = useState('idle'); // idle, countdown, listening
  const [countdownValue, setCountdownValue] = useState(3);
  const [hasUsedMic, setHasUsedMic] = useState(false);
  const recognitionRef = useRef(null);

  const pathname = usePathname();

  useEffect(() => {
    chatInputRef.current = chatInput;
  }, [chatInput]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('virdia-theme');
    if (savedTheme === 'light') { setTheme('light'); document.body.classList.add('light-mode'); }

    const savedRole = localStorage.getItem('virdia-role');
    if (savedRole) setRole(savedRole);

    const interval = setInterval(() => {
      const now = new Date();
      setTime(now.toLocaleTimeString('pt-BR', { hour12: false }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('virdia-theme', newTheme);
    if (newTheme === 'light') document.body.classList.add('light-mode');
    else document.body.classList.remove('light-mode');
  };

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    setRole(newRole);
    localStorage.setItem('virdia-role', newRole);
    window.location.reload(); // Força recarregamento para alterar Sidebar e Conteúdo
  };

  const isActive = (path) => {
    if (path === '/' && pathname === '/') return 'active';
    if (path !== '/' && pathname.startsWith(path)) return 'active';
    return '';
  };

  const handleSend = () => {
    const text = chatInputRef.current.trim();
    if (!text) return;
    
    setMessages(prev => [...prev, { role: 'user', text, time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }]);
    setChatInput('');
    
    const ta = document.getElementById('nuvia-textarea');
    if (ta) ta.style.height = 'auto';
    
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Entendido. Estou analisando os dados públicos mais recentes de vulnerabilidade climática para a sua região.', time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }]);
    }, 1500);
  };

  const handleMicClick = () => {
    if (micState !== 'idle') {
      if (recognitionRef.current) recognitionRef.current.stop();
      setMicState('idle');
      handleSend(); // Send text when stopping mic
      return;
    }

    if (!hasUsedMic) {
      setMicState('countdown');
      setCountdownValue(3);
      let count = 3;
      const interval = setInterval(() => {
        count -= 1;
        if (count > 0) {
          setCountdownValue(count);
        } else {
          clearInterval(interval);
          setHasUsedMic(true);
          startListening();
        }
      }, 1000);
    } else {
      startListening();
    }
  };

  const startListening = () => {
    setMicState('listening');
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Seu navegador não suporta reconhecimento de voz.');
      setMicState('idle');
      return;
    }
    
    if (recognitionRef.current) recognitionRef.current.stop();
    
    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.interimResults = true;
    recognition.continuous = true;
    
    const initialText = chatInputRef.current;
    
    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; ++i) {
        transcript += event.results[i][0].transcript;
      }
      setChatInput((initialText ? initialText + (initialText.endsWith(' ') ? '' : ' ') : '') + transcript);
    };
    
    recognition.onend = () => {
      // Don't auto send here, just set idle
      setMicState('idle');
    };
    
    recognitionRef.current = recognition;
    recognition.start();
  };

  return (
    <>
      <header className="topbar">
        <div className="topbar-left">
          <div className="brand-logo">
            <Link href="/">
              <img 
                src={theme === 'light' ? '/logo-light.png' : '/logo-dark.png'} 
                alt="Logo" 
                style={{ 
                  height: 60, 
                  width: 'auto', 
                  objectFit: 'contain',
                  transform: theme === 'light' ? 'scale(1.4)' : 'none',
                  cursor: 'pointer'
                }} 
                onError={(e) => { e.target.style.display = 'none' }} 
              />
            </Link>
          </div>
        </div>

        <div className="topbar-right">
          <div className="clock-panel glass-panel">
            {time || "00:00:00"}
          </div>

          <div className="actions-group" style={{ position: 'relative' }}>
            <button className="action-btn" onClick={toggleTheme}>
              <Sun size={20} />
            </button>
            <button className="action-btn relative" onClick={() => { setShowNotifications(!showNotifications); setShowAssistant(false); }}>
              <Bell size={20} />
              <span className="notification-dot"></span>
            </button>
            <button className="action-btn relative" onClick={() => { setShowAssistant(!showAssistant); setShowNotifications(false); }}>
              <Bot size={20} />
            </button>
            <div style={{ position: 'relative', marginLeft: '8px' }}>
              <button 
                onClick={() => setLangOpen(!langOpen)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '6px 10px', borderRadius: '8px',
                  background: 'var(--bg-card)', color: 'var(--text-primary)',
                  border: '1px solid var(--border-glass)', cursor: 'pointer',
                  fontSize: '14px', fontWeight: 'bold'
                }}
              >
                {lang === 'pt' ? <><img src="https://flagcdn.com/w20/br.png" alt="PT" /> PT</> : 
                 lang === 'en' ? <><img src="https://flagcdn.com/w20/us.png" alt="EN" /> EN</> : 
                 <><img src="https://flagcdn.com/w20/es.png" alt="ES" /> ES</>}
              </button>
              
              {langOpen && (
                <div style={{
                  position: 'absolute', top: '100%', right: 0, marginTop: '8px',
                  background: 'var(--bg-card)', border: '1px solid var(--border-glass)',
                  borderRadius: '8px', padding: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  zIndex: 2000, display: 'flex', flexDirection: 'column', gap: '2px', minWidth: '90px'
                }}>
                  <button onClick={() => {setLang('pt'); setLangOpen(false)}} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', padding: '8px', textAlign: 'left', cursor: 'pointer', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '13px' }}><img src="https://flagcdn.com/w20/br.png" alt="PT" /> PT</button>
                  <button onClick={() => {setLang('en'); setLangOpen(false)}} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', padding: '8px', textAlign: 'left', cursor: 'pointer', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '13px' }}><img src="https://flagcdn.com/w20/us.png" alt="EN" /> EN</button>
                  <button onClick={() => {setLang('es'); setLangOpen(false)}} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', padding: '8px', textAlign: 'left', cursor: 'pointer', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '13px' }}><img src="https://flagcdn.com/w20/es.png" alt="ES" /> ES</button>
                </div>
              )}
            </div>
            
            {showNotifications && (
              <div style={{ position: 'absolute', top: '100%', right: '120px', marginTop: '10px', width: '280px', background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: '12px', padding: '16px', boxShadow: 'var(--shadow-glass)', zIndex: 1000, textAlign: 'center' }}>
                <Bell size={32} color="#9ca3af" style={{ margin: '0 auto 10px', opacity: 0.5 }} />
                <h4 style={{ margin: 0, fontSize: '14px', color: 'var(--text-primary)' }}>{t('noNotifications')}</h4>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#9ca3af' }}>{t('upToDate')}</p>
              </div>
            )}
            
            <div className="role-selector">
              <User size={16} />
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="gestor">{t('gestor')}</option>
                <option value="cidadao">{t('cidadao')}</option>
                <option value="tcu">{t('tcu')}</option>
                <option value="mp">Ministério Público (MP)</option>
                <option value="auditor">{t('auditor')}</option>
              </select>
            </div>
            
            <button className={`action-btn menu-trigger ${isMenuOpen ? 'active' : ''}`} onClick={() => setIsMenuOpen(true)}>
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Assistente IA (Bot) Panel */}
      {showAssistant && (
        <aside 
          className="transition-colors duration-300"
          style={{
            position: 'fixed',
            top: '70px',
            right: '0',
            bottom: '0',
            width: '100%',
            maxWidth: '360px',
            borderLeft: '1px solid rgba(31, 41, 55, 0.8)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 9999,
            boxShadow: '-10px 0 25px rgba(0,0,0,0.5)',
            backgroundColor: '#0c0e14',
            color: '#fff',
          }}
        >
          <div style={{ padding: '16px', borderBottom: '1px solid rgba(31, 41, 55, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                <Bot size={16} />
              </div>
              <div>
                <h3 style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Assistente Clima 360</h3>
                <p style={{ fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6b7280', margin: 0, marginTop: '2px' }}>Governança Climática</p>
              </div>
            </div>
            <button 
              onClick={() => setShowAssistant(false)}
              style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid rgba(31, 41, 55, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', backgroundColor: 'rgba(17, 24, 39, 0.5)', color: '#9ca3af', cursor: 'pointer' }}
            >
              <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }} className="custom-scrollbar">
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', maxWidth: '85%', alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{ padding: '12px', borderRadius: '16px', borderTopLeftRadius: msg.role === 'assistant' ? '0' : '16px', borderTopRightRadius: msg.role === 'user' ? '0' : '16px', fontSize: '12px', lineHeight: '1.6', backgroundColor: msg.role === 'user' ? '#059669' : 'rgba(17, 24, 39, 0.6)', border: msg.role === 'user' ? 'none' : '1px solid rgba(31, 41, 55, 0.8)', color: msg.role === 'user' ? '#fff' : '#e5e7eb' }}>
                  {msg.text}
                </div>
                <span style={{ fontSize: '8px', fontFamily: 'monospace', fontWeight: 'bold', marginTop: '4px', padding: '0 4px', color: '#4b5563' }}>
                  {msg.time}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          <div style={{ padding: '16px', borderTop: '1px solid rgba(31, 41, 55, 0.5)' }}>
            <div style={{ position: 'relative', marginBottom: '8px', height: '16px', display: 'flex', justifyContent: 'center' }}>
              {micState === 'countdown' && (
                <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 'bold' }}>Fale em {countdownValue}...</span>
              )}
              {micState === 'listening' && (
                <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 'bold', animation: 'pulse 1.5s infinite' }}>Fale agora.</span>
              )}
            </div>
            <div style={{ borderRadius: '24px', border: '1px solid rgba(31, 41, 55, 0.6)', paddingLeft: '16px', paddingRight: '6px', paddingTop: '6px', paddingBottom: '6px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', backgroundColor: '#02040a' }}>
              <textarea 
                id="nuvia-textarea"
                className="hide-scrollbar"
                placeholder={t('typeQuestion')} 
                style={{ 
                  backgroundColor: 'transparent', 
                  border: 'none', 
                  outline: 'none', 
                  fontSize: '13px', 
                  flex: 1, 
                  marginRight: '8px', 
                  color: '#fff',
                  resize: 'none',
                  minHeight: '24px',
                  maxHeight: '100px', // About 5 lines
                  overflowY: 'auto',
                  paddingTop: '8px',
                  paddingBottom: '8px',
                  fontFamily: 'inherit',
                  lineHeight: '1.4'
                }} 
                rows={1}
                value={chatInput}
                onChange={(e) => {
                  setChatInput(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = (e.target.scrollHeight <= 100 ? e.target.scrollHeight : 100) + 'px';
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                    e.target.style.height = 'auto';
                  }
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', paddingBottom: '2px' }}>
                <button 
                  onClick={handleMicClick}
                  style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', backgroundColor: micState !== 'idle' ? 'rgba(239, 68, 68, 0.2)' : 'transparent', color: micState !== 'idle' ? '#ef4444' : '#9ca3af', border: 'none', cursor: 'pointer' }}
                >
                  {micState !== 'idle' ? (
                    <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" style={{ fontSize: '20px' }} height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="6" width="12" height="12" rx="2" ry="2"></rect></svg>
                  ) : (
                    <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" style={{ fontSize: '24px' }} height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                  )}
                </button>
                <button onClick={handleSend} style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#059669', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', boxShadow: '0 0 8px rgba(16,185,129,0.3)', border: 'none', cursor: 'pointer' }}>
                  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" style={{ fontSize: '14px' }} height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                </button>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* OVERLAY DRAWER - CÓPIA EXATA DA IMAGEM */}
      <div className={`drawer-overlay ${isMenuOpen ? 'open' : ''}`} onClick={() => setIsMenuOpen(false)}>
        <div className={`drawer-content ${isMenuOpen ? 'open' : ''}`} onClick={e => e.stopPropagation()}>
          <div className="drawer-header">
            <h2>{t('panelControl')}</h2>
            <button className="close-btn" onClick={() => setIsMenuOpen(false)}>
              <X size={16} />
            </button>
          </div>

          <div className="drawer-body">
            <div className="drawer-nav">
              {role === 'gestor' && (
                <>
                  <Link href="/" style={{textDecoration: 'none'}} onClick={() => setIsMenuOpen(false)}>
                    <div className={`drawer-item ${isActive('/')}`}>
                      <div className="icon-box"><Activity size={18} /></div>
                      <div className="item-text">
                        <span className="item-title">{t('generalPanel')}</span>
                        <span className="item-desc">{t('generalPanelDesc')}</span>
                      </div>
                    </div>
                  </Link>
                  <Link href="/fontes" style={{textDecoration: 'none'}} onClick={() => setIsMenuOpen(false)}>
                    <div className={`drawer-item ${isActive('/fontes')}`}>
                      <div className="icon-box"><Database size={18} /></div>
                      <div className="item-text">
                        <span className="item-title">{t('dataSources')}</span>
                        <span className="item-desc">{t('dataSourcesDesc')}</span>
                      </div>
                    </div>
                  </Link>
                  <Link href="/configuracoes" style={{textDecoration: 'none'}} onClick={() => setIsMenuOpen(false)}>
                    <div className={`drawer-item ${isActive('/configuracoes')}`}>
                      <div className="icon-box"><Database size={18} /></div>
                      <div className="item-text">
                        <span className="item-title">{t('configSettings')}</span>
                        <span className="item-desc">{t('configSettingsDesc')}</span>
                      </div>
                    </div>
                  </Link>
                  <Link href="/api-docs" style={{textDecoration: 'none'}} onClick={() => setIsMenuOpen(false)}>
                    <div className={`drawer-item ${isActive('/api-docs')}`}>
                      <div className="icon-box"><FileCode2 size={18} /></div>
                      <div className="item-text">
                        <span className="item-title">API Clima 360</span>
                        <span className="item-desc">Acesso e testes aos endpoints de dados</span>
                      </div>
                    </div>
                  </Link>
                </>
              )}

              {role === 'cidadao' && (
                <>
                  <Link href="/" style={{textDecoration: 'none'}} onClick={() => setIsMenuOpen(false)}>
                    <div className={`drawer-item ${isActive('/')}`}>
                      <div className="icon-box"><MapPin size={18} /></div>
                      <div className="item-text">
                        <span className="item-title">{t('alertsMap')}</span>
                        <span className="item-desc">{t('alertsMapDesc')}</span>
                      </div>
                    </div>
                  </Link>
                  <Link href="/educacao" style={{textDecoration: 'none'}} onClick={() => setIsMenuOpen(false)}>
                    <div className={`drawer-item ${isActive('/educacao')}`}>
                      <div className="icon-box"><BookOpen size={18} /></div>
                      <div className="item-text">
                        <span className="item-title">{t('educaClima')}</span>
                        <span className="item-desc">{t('educaClimaDesc')}</span>
                      </div>
                    </div>
                  </Link>
                  <Link href="/cobrar" style={{textDecoration: 'none'}} onClick={() => setIsMenuOpen(false)}>
                    <div className="drawer-item">
                      <div className="icon-box"><FilePlus2 size={18} /></div>
                      <div className="item-text">
                        <span className="item-title">{t('cobrarGoverno')}</span>
                        <span className="item-desc">{t('cobrarGovernoDesc')}</span>
                      </div>
                    </div>
                  </Link>
                  <Link href="/totem" style={{textDecoration: 'none'}} onClick={() => setIsMenuOpen(false)}>
                    <div className={`drawer-item ${isActive('/totem')}`}>
                      <div className="icon-box"><Monitor size={18} /></div>
                      <div className="item-text">
                        <span className="item-title">{t('totemAtendimento')}</span>
                        <span className="item-desc">{t('totemAtendimentoDesc')}</span>
                      </div>
                    </div>
                  </Link>
                  <Link href="/whatsapp" style={{textDecoration: 'none'}} onClick={() => setIsMenuOpen(false)}>
                    <div className={`drawer-item ${isActive('/whatsapp')}`}>
                      <div className="icon-box"><span style={{fontSize:'18px'}}>💬</span></div>
                      <div className="item-text">
                        <span className="item-title">{t('whatsappBot')}</span>
                        <span className="item-desc">{t('whatsappBotDesc')}</span>
                      </div>
                    </div>
                  </Link>
                </>
              )}

              {role === 'tcu' && (
                <>
                  <Link href="/" style={{textDecoration: 'none'}} onClick={() => setIsMenuOpen(false)}>
                    <div className={`drawer-item ${isActive('/')}`}>
                      <div className="icon-box"><ScanEye size={18} /></div>
                      <div className="item-text">
                        <span className="item-title">{t('tcuDemands')}</span>
                        <span className="item-desc">{t('tcuDemandsDesc')}</span>
                      </div>
                    </div>
                  </Link>
                </>
              )}

              {role === 'auditor' && (
                <>
                  <Link href="/" style={{textDecoration: 'none'}} onClick={() => setIsMenuOpen(false)}>
                    <div className={`drawer-item ${isActive('/')}`}>
                      <div className="icon-box"><ScanEye size={18} /></div>
                      <div className="item-text">
                        <span className="item-title">{t('welcomeAuditor')}</span>
                        <span className="item-desc">{t('welcomeAuditorDesc')}</span>
                      </div>
                    </div>
                  </Link>
                </>
              )}
            </div>

            <Link href="/painel-clima" style={{textDecoration: 'none'}} onClick={() => setIsMenuOpen(false)}>
              <div className={`drawer-item ${isActive('/painel-clima')}`}>
                <div className="icon-box"><Sun size={18} /></div>
                <div className="item-text">
                  <span className="item-title">Painel Clima</span>
                  <span className="item-desc">Organização de dados climáticos</span>
                </div>
              </div>
            </Link>

            <button className="drawer-item logout-item" onClick={() => setIsMenuOpen(false)}>
              <div className="icon-box logout-icon"><X size={18} /></div>
              <div className="item-text">
                <span className="item-title logout-title">Sair do sistema</span>
                <span className="item-desc logout-desc">Encerrar sessão</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .role-selector { display: flex; align-items: center; gap: 8px; background: var(--bg-card); padding: 6px 12px; border-radius: 20px; border: 1px solid var(--border-glass); margin: 0 12px; }
        .role-selector select { background: transparent; border: none; color: var(--text-primary); outline: none; font-family: var(--font-inter); font-size: 13px; font-weight: 600; cursor: pointer; }
        .role-selector select option { background: var(--bg-main); color: var(--text-primary); }

        .topbar {
          display: flex; align-items: center; justify-content: space-between;
          height: 72px; background: var(--bg-card);
          border-bottom: 1px solid var(--border-glass);
          padding: 0 32px; color: var(--text-primary); z-index: 1000;
        }
        .topbar-left { display: flex; align-items: center; gap: 16px; }
        .brand-logo { display: flex; align-items: center; justify-content: center; height: 60px; }
        .brand-title { display: flex; align-items: baseline; gap: 12px; }
        .brand-subtitle { font-family: var(--font-inter); font-size: 11px; font-weight: 600; color: var(--text-muted); letter-spacing: 1px; }

        .topbar-right { display: flex; align-items: center; gap: 32px; }
        .stats-group { display: flex; align-items: center; gap: 24px; }
        .stat-item { display: flex; flex-direction: column; align-items: center; gap: 2px; }
        .stat-value { font-size: 18px; font-weight: 700; font-family: var(--font-outfit); }
        .text-gradient { color: var(--brand-primary); }
        .text-danger { color: var(--danger); }
        .stat-label { font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
        .stat-divider { width: 1px; height: 32px; background: rgba(255,255,255,0.08); }

        .clock-panel {
          padding: 8px 20px; font-family: var(--font-outfit); font-size: 18px; font-weight: 500; color: var(--text-primary);
          background: var(--bg-card); border: 1px solid var(--border-glass); border-radius: 8px; letter-spacing: 2px;
        }

        .actions-group { display: flex; align-items: center; gap: 12px; }
        .action-btn {
          width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
          color: #9CA3AF; transition: 0.3s; background: transparent; border: none; cursor: pointer;
        }
        .action-btn:hover { background: var(--bg-card-hover); color: var(--text-primary); }
        .relative { position: relative; }
        .notification-dot {
          position: absolute; top: 10px; right: 10px; width: 8px; height: 8px; background: var(--danger);
          border-radius: 50%; box-shadow: 0 0 10px var(--danger);
        }

        /* DRAWER IDÊNTICO À IMAGEM DO PORTVISION */
        .drawer-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          z-index: 9999;
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s ease;
        }
        .drawer-overlay.open { opacity: 1; visibility: visible; }

        .drawer-content {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          width: 320px; 
          background: var(--bg-main); 
          border-left: 1px solid var(--border-glass);
          display: flex;
          flex-direction: column;
          transform: translateX(100%);
          transition: all 0.3s ease;
        }
        .drawer-content.open { transform: translateX(0); }

        .drawer-header {
          padding: 24px 20px 16px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border-glass);
        }

        .drawer-header h2 {
          font-family: var(--font-inter);
          font-size: 14px;
          font-weight: 800; 
          color: var(--text-primary); 
          margin: 0;
        }

        .close-btn {
          background: var(--bg-card); 
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          width: 32px; height: 32px; border-radius: 50%;
          transition: 0.2s;
        }
        .close-btn:hover { background: var(--bg-card-hover); color: var(--text-primary); }

        .drawer-body {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px; 
        }
        
        .drawer-body::-webkit-scrollbar { width: 4px; }
        .drawer-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }

        .drawer-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          border-radius: 12px; 
          text-decoration: none;
          background: var(--bg-card); 
          border: 1px solid var(--border-glass);
          transition: 0.2s;
          cursor: pointer;
          text-align: left;
          width: 100%;
        }

        .drawer-item:hover, .drawer-item.active {
          background: var(--bg-card-hover);
          border-color: var(--border-focus);
        }

        .icon-box {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: rgba(0,0,0,0.1); 
          color: var(--text-secondary); 
          flex-shrink: 0;
        }

        .item-text {
          display: flex;
          flex-direction: column;
        }

        .item-title { font-family: var(--font-inter); font-size: 13px; font-weight: 700; color: var(--text-primary); margin-bottom: 2px; }
        .item-desc { font-family: var(--font-inter); font-size: 11px; color: var(--text-muted); font-weight: 500; }

        .drawer-item.active .icon-box { background: var(--brand-primary); color: #fff; }
        .drawer-item.active .item-title { color: var(--brand-primary); }

        /* Botão Sair Vermelho */
        .logout-title {
          color: var(--text-primary);
        }
        .logout-desc {
          color: #F43F5E; 
        }
      `}</style>
    </>
  );
}
