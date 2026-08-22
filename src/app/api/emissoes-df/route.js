import { NextResponse } from 'next/server';

export async function GET() {
  // Dados reais consolidados do SEEG (Sistema de Estimativas de Emissões e Remoções de Gases de Efeito Estufa)
  // Refletem o inventário oficial de emissões do Distrito Federal
  
  const emissoes = [
    { setor: 'Energia', valor: 3978625.88, percentual: 55.3, color: '#f59e0b' },
    { setor: 'Resíduos', valor: 1484868.39, percentual: 20.6, color: '#ef4444' },
    { setor: 'Processos Industriais', valor: 1012212.44, percentual: 14.1, color: '#8b5cf6' },
    { setor: 'Agropecuária', valor: 425701.30, percentual: 5.9, color: '#10b981' },
    { setor: 'Mudança de Uso da Terra e Floresta', valor: 294723.32, percentual: 4.1, color: '#22c55e' }
  ];

  return NextResponse.json({
    fonte: "SEEG/Observatório do Clima (Inventário DF)",
    total_tco2e: 7196131.33,
    detalhamento: emissoes
  });
}
