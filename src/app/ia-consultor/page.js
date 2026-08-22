"use client";
import { useState, useEffect, useRef } from 'react';
import { Brain, Send, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function IAConsultorPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/ia-consultor');
      const data = await res.json();
      if(data.length > 0) {
        // Formata os dados do banco para o padrão de chat
        const history = data.reverse().flatMap(row => [
          { role: 'user', content: row.pergunta, id: `u-${row.id}` },
          { role: 'assistant', content: row.resposta, id: `a-${row.id}` }
        ]);
        setMessages(history);
      } else {
        setMessages([{ role: 'assistant', content: 'Olá! Sou a IA do Virdia OS. Analiso os dados da cidade em tempo real. Como posso ajudar com a gestão de resíduos hoje?', id: 'welcome' }]);
      }
    } catch(e) {}
  };

  useEffect(() => { fetchHistory(); }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => { scrollToBottom(); }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if(!input.trim()) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg, id: Date.now() }]);
    setIsTyping(true);

    // Simula tempo de resposta inteligente
    await new Promise(r => setTimeout(r, 1500));

    // Resposta contextual falsa mas realista
    let aiResponse = "Analisando os dados do Gêmeo Digital... ";
    if(userMsg.toLowerCase().includes("rota") || userMsg.toLowerCase().includes("caminhão")) {
      aiResponse = "Detectei que a **Rota 04** está com ociosidade de 15%. Sugiro redirecionar o Caminhão A para o Setor Industrial, onde o volume de recicláveis aumentou 22% nas últimas 48h. Deseja que eu emita o alerta automático para o motorista?";
    } else if(userMsg.toLowerCase().includes("educação") || userMsg.toLowerCase().includes("escola")) {
      aiResponse = "A Escola Municipal Y teve uma queda de 30% na separação correta. Recomendo ativar a **Campanha Gamificada Ouro** para os alunos do ensino fundamental na próxima segunda-feira.";
    } else {
      aiResponse = "Cruzando os dados de IoT com o mapa de calor, percebemos uma alta taxa de contaminação orgânica no ecoponto central. A ação recomendada é realizar uma vistoria técnica nas próximas 24h.";
    }

    try {
      // Salva no banco
      const res = await fetch('/api/ia-consultor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pergunta: userMsg, resposta: aiResponse })
      });
      const saved = await res.json();
      
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse, id: `a-${saved.id}` }]);
    } catch(e) {
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse, id: Date.now() }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="chat-container fade-in">
      <div className="chat-header">
        <Brain size={24} color="#8B5CF6" />
        <div>
          <h1 className="chat-title text-gradient">Consultor Municipal IA</h1>
          <p className="chat-subtitle">Análise Preditiva e Geração de Insights Baseado em IoT</p>
        </div>
      </div>

      <div className="chat-messages glass-panel">
        {messages.map((m) => (
          <div key={m.id} className={`message-wrapper ${m.role}`}>
            {m.role === 'assistant' && (
              <div className="avatar ai-avatar"><Brain size={16} /></div>
            )}
            <div className={`message-bubble ${m.role}`}>
              <ReactMarkdown>{m.content}</ReactMarkdown>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="message-wrapper assistant">
            <div className="avatar ai-avatar"><Brain size={16} /></div>
            <div className="message-bubble assistant typing">
              <Loader2 className="spin" size={16} /> Processando dados do mapa...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-area" onSubmit={handleSend}>
        <input 
          type="text" 
          placeholder="Pergunte sobre rotas, ecopontos ou educação ambiental..." 
          value={input} 
          onChange={e => setInput(e.target.value)}
          disabled={isTyping}
        />
        <button type="submit" disabled={!input.trim() || isTyping}>
          <Send size={18} />
        </button>
      </form>

      <style jsx>{`
        .chat-container { display: flex; flex-direction: column; height: 100%; padding: 32px; gap: 20px; overflow: hidden; }
        .chat-header { display: flex; align-items: center; gap: 16px; flex-shrink: 0; }
        .chat-title { font-family: var(--font-outfit); font-size: 28px; font-weight: 800; margin: 0; }
        .chat-subtitle { color: var(--text-secondary); font-size: 14px; margin: 0; }
        
        .chat-messages { flex: 1; overflow-y: auto; background: var(--bg-card); border-radius: 16px; border: 1px solid var(--border-glass); padding: 24px; display: flex; flex-direction: column; gap: 24px; }
        .message-wrapper { display: flex; gap: 12px; max-width: 80%; }
        .message-wrapper.user { align-self: flex-end; flex-direction: row-reverse; }
        
        .avatar { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .ai-avatar { background: rgba(139, 92, 246, 0.2); color: #8B5CF6; }
        
        .message-bubble { padding: 12px 16px; border-radius: 16px; font-size: 14px; line-height: 1.6; color: var(--text-primary); }
        .message-bubble p { margin: 0; }
        .message-bubble.user { background: var(--brand-primary); color: #fff; border-bottom-right-radius: 4px; }
        .message-bubble.assistant { background: rgba(0,0,0,0.2); border: 1px solid var(--border-glass); border-bottom-left-radius: 4px; }
        .typing { display: flex; align-items: center; gap: 8px; font-style: italic; color: var(--text-secondary); }
        
        .chat-input-area { display: flex; gap: 12px; flex-shrink: 0; }
        .chat-input-area input { flex: 1; padding: 16px 24px; border-radius: 30px; background: var(--bg-card); border: 1px solid var(--border-glass); color: var(--text-primary); font-size: 15px; outline: none; transition: 0.2s; }
        .chat-input-area input:focus { border-color: #8B5CF6; box-shadow: 0 0 0 2px rgba(139,92,246,0.2); }
        .chat-input-area button { width: 54px; height: 54px; border-radius: 50%; background: #8B5CF6; color: white; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; }
        .chat-input-area button:hover:not(:disabled) { transform: scale(1.05); background: #7C3AED; }
        .chat-input-area button:disabled { opacity: 0.5; cursor: not-allowed; }
        
        .spin { animation: spin 1s linear infinite; }
        .fade-in { animation: fadeIn 0.4s ease-out; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}