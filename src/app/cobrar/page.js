"use client";
import CobrarSimulator from '@/components/CobrarSimulator';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CobrarPage() {
  return (
    <div style={{ height: '100vh', width: '100vw', background: 'var(--bg-main)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', padding: '80px 40px', overflowY: 'auto' }}>
      <div style={{ position: 'absolute', top: '24px', left: '24px' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 'bold' }}>
          <ArrowLeft size={20} /> Voltar
        </Link>
      </div>
      <div style={{ width: '100%', maxWidth: '600px' }}>
        <div style={{ marginBottom: '24px', background: 'var(--bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-glass)', boxShadow: 'var(--shadow-glass)' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)' }}>🎓 Aprenda sobre o clima</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.5' }}>Assista a este vídeo rápido elaborado pelo TCU e parceiros para entender como identificar e cobrar por melhorias ambientais na sua região.</p>
          <div style={{ width: '100%', height: '240px', background: '#000', borderRadius: '12px', overflow: 'hidden' }}>
            <iframe 
              width="100%" 
              height="100%" 
              src="https://www.youtube.com/embed/z9bZkfPuNNY" 
              title="Educação Climática" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen>
            </iframe>
          </div>
        </div>
        <CobrarSimulator />
      </div>
    </div>
  );
}
