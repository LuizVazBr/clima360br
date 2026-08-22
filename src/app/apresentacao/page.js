"use client";
import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function ApresentacaoPage() {
  const [slide, setSlide] = useState(1);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 999999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)', color: '#fff' }}>
      
      {/* Logo */}
      <div style={{ position: 'absolute', top: '40px' }}>
        <img src="/logo-light.png" alt="Clima 360" style={{ height: '80px' }} />
      </div>

      {slide === 1 && <Slide1 />}
      {slide === 2 && <Slide2 />}
      {slide === 3 && <Slide3 />}

      {/* Botões de navegação */}
      <div style={{ position: 'absolute', bottom: '40px', display: 'flex', gap: '16px' }}>
        {slide > 1 && (
          <button onClick={() => setSlide(slide - 1)} style={{ padding: '12px 24px', background: 'transparent', border: '1px solid var(--border-glass)', borderRadius: '30px', color: '#fff', cursor: 'pointer' }}>Anterior</button>
        )}
        {slide < 3 && (
          <button onClick={() => setSlide(slide + 1)} style={{ padding: '12px 32px', background: 'var(--brand-primary)', border: 'none', borderRadius: '30px', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>Próximo ➔</button>
        )}
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes popIn {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
          70% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function Slide1() {
  return (
    <div style={{ position: 'relative', width: '500px', height: '300px', animation: 'fadeIn 0.5s' }}>
      <Node top="50px" left="100px" label="TCU" color="#3b82f6" />
      <Node top="50px" left="400px" label="MP" color="#8b5cf6" />
      <Node top="250px" left="100px" label="Gestor" color="#f59e0b" />
      <Node top="250px" left="400px" label="Auditor" color="#64748b" />
      <Node top="150px" left="250px" label="Cidadão" color="#10B981" isCenter />
      
      {/* X Icons indicating disconnect */}
      <div style={{ position: 'absolute', top: '100px', left: '175px', transform: 'translate(-50%, -50%)', color: '#ef4444' }}><X size={40} strokeWidth={3} /></div>
      <div style={{ position: 'absolute', top: '100px', left: '325px', transform: 'translate(-50%, -50%)', color: '#ef4444' }}><X size={40} strokeWidth={3} /></div>
      <div style={{ position: 'absolute', top: '200px', left: '175px', transform: 'translate(-50%, -50%)', color: '#ef4444' }}><X size={40} strokeWidth={3} /></div>
      <div style={{ position: 'absolute', top: '200px', left: '325px', transform: 'translate(-50%, -50%)', color: '#ef4444' }}><X size={40} strokeWidth={3} /></div>
      <div style={{ position: 'absolute', top: '150px', left: '100px', transform: 'translate(-50%, -50%)', color: '#ef4444' }}><X size={40} strokeWidth={3} /></div>
      <div style={{ position: 'absolute', top: '150px', left: '400px', transform: 'translate(-50%, -50%)', color: '#ef4444' }}><X size={40} strokeWidth={3} /></div>
      <div style={{ position: 'absolute', top: '50px', left: '250px', transform: 'translate(-50%, -50%)', color: '#ef4444' }}><X size={40} strokeWidth={3} /></div>
      <div style={{ position: 'absolute', top: '250px', left: '250px', transform: 'translate(-50%, -50%)', color: '#ef4444' }}><X size={40} strokeWidth={3} /></div>
    </div>
  );
}

function Slide2() {
  return (
    <div style={{ position: 'relative', width: '500px', height: '300px', animation: 'fadeIn 0.5s' }}>
      <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
         <defs>
           <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
             <path d="M 0 0 L 10 5 L 0 10 z" fill="#10B981" />
           </marker>
         </defs>
         {/* Circular arrows */}
         <path d="M 140 50 Q 250 10 360 50" fill="none" stroke="#10B981" strokeWidth="4" markerEnd="url(#arrow)" />
         <path d="M 400 90 Q 440 150 400 210" fill="none" stroke="#10B981" strokeWidth="4" markerEnd="url(#arrow)" />
         <path d="M 360 250 Q 250 290 140 250" fill="none" stroke="#10B981" strokeWidth="4" markerEnd="url(#arrow)" />
         <path d="M 100 210 Q 60 150 100 90" fill="none" stroke="#10B981" strokeWidth="4" markerEnd="url(#arrow)" />
         
         {/* To Center */}
         <line x1="250" y1="150" x2="135" y2="85" stroke="#10B981" strokeWidth="3" markerEnd="url(#arrow)" />
         <line x1="250" y1="150" x2="365" y2="85" stroke="#10B981" strokeWidth="3" markerEnd="url(#arrow)" />
         <line x1="250" y1="150" x2="135" y2="215" stroke="#10B981" strokeWidth="3" markerEnd="url(#arrow)" />
         <line x1="250" y1="150" x2="365" y2="215" stroke="#10B981" strokeWidth="3" markerEnd="url(#arrow)" />
      </svg>

      <Node top="50px" left="100px" label="TCU" color="#3b82f6" />
      <Node top="50px" left="400px" label="MP" color="#8b5cf6" />
      <Node top="250px" left="100px" label="Gestor" color="#f59e0b" />
      <Node top="250px" left="400px" label="Auditor" color="#64748b" />
      <Node top="150px" left="250px" label="Cidadão" color="#10B981" isCenter />
    </div>
  );
}

function Slide3() {
  return (
    <div style={{ textAlign: 'center', animation: 'fadeIn 0.5s' }}>
      <h1 style={{ fontSize: '80px', fontWeight: '900', background: 'linear-gradient(90deg, #10B981, #3b82f6)', WebkitBackgroundClip: 'text', color: 'transparent', margin: 0, textTransform: 'uppercase', letterSpacing: '4px' }}>
        Unificar
        <br/>e Otimizar
      </h1>
    </div>
  );
}

function Node({ top, left, label, color, isCenter }) {
  return (
    <div style={{
      position: 'absolute',
      top, left,
      transform: 'translate(-50%, -50%)',
      width: isCenter ? '110px' : '90px', 
      height: isCenter ? '110px' : '90px',
      borderRadius: '50%',
      background: isCenter ? color : 'var(--bg-card)',
      border: `3px solid ${color}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: '900', fontSize: isCenter ? '18px' : '15px',
      color: isCenter ? '#fff' : color,
      boxShadow: `0 0 30px ${color}40`,
      zIndex: 1,
      animation: \`popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards\`,
    }}>
      {label}
    </div>
  );
}

function Node({ top, left, label, color, isCenter, delay }) {
  return (
    <div style={{
      position: 'absolute',
      top, left,
      transform: 'translate(-50%, -50%)',
      width: isCenter ? '110px' : '90px', 
      height: isCenter ? '110px' : '90px',
      borderRadius: '50%',
      background: isCenter ? color : 'var(--bg-card)',
      border: `3px solid ${color}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: '900', fontSize: isCenter ? '18px' : '15px',
      color: isCenter ? '#fff' : color,
      boxShadow: `0 0 30px ${color}40`,
      zIndex: 1,
      animation: `popIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards`,
      animationDelay: delay,
      opacity: 0,
    }}>
      {label}
    </div>
  );
}
