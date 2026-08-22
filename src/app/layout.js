import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import HydrationLoader from '@/components/HydrationLoader';
import { LangProvider } from '@/contexts/LangContext';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export const metadata = {
  title: 'Clima 360',
  description: 'Sistema Inteligente para Gestão da Economia Circular',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} ${outfit.variable}`} style={{ margin: 0, padding: 0, overflow: 'hidden', height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <LangProvider>
        <HydrationLoader />

        {/* Header Global */}
        <Topbar />

        {/* Corpo (Sidebar + Conteúdo) */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <Sidebar />
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            {children}
          </div>
        </div>
        </LangProvider>
      </body>
    </html>
  );
}
