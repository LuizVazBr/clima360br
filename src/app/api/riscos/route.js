import { NextResponse } from 'next/server';

export async function GET() {
  const riskData = [
    { name: 'Fercal - Risco de Deslizamento', lat: -15.602, lng: -47.868, radius: 2500, color: '#ef4444', level: 'Alto Risco' },
    { name: 'Vicente Pires - Risco de Alagamento', lat: -15.801, lng: -48.026, radius: 3000, color: '#f97316', level: 'Risco Médio' },
    { name: 'Sol Nascente - Deslizamento e Inundação', lat: -15.823, lng: -48.136, radius: 3500, color: '#ef4444', level: 'Alto Risco' },
    { name: 'Arniqueiras - Risco de Enchente', lat: -15.845, lng: -48.012, radius: 2000, color: '#f97316', level: 'Risco Médio' },
    { name: 'Vila Cauhy - Área de Inundação', lat: -15.875, lng: -47.965, radius: 1500, color: '#ef4444', level: 'Alto Risco' },
    { name: 'Sobradinho II - Deslizamento', lat: -15.632, lng: -47.810, radius: 2000, color: '#ef4444', level: 'Alto Risco' }
  ];

  return NextResponse.json(riskData);
}