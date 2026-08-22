import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request) {
  try {
    const { prompt } = await request.json();
    
    // Simulate AI retrieving real data from DB
    const p = prompt.toLowerCase();
    
    let answer = "";
    let title = "Resposta da IA Clima 360";

    // Pega as estatísticas reais
    if (p.includes('queimada') || p.includes('incêndio') || p.includes('fogo')) {
      const { rows } = await pool.query("SELECT COUNT(*) FROM ouvidoria WHERE assunto_nome ILIKE '%incêndio%' OR assunto_nome ILIKE '%queimada%'");
      answer = `Atualmente, temos ${rows[0].count} registros de queimadas ou incêndios reportados pela população no Distrito Federal. As regiões com mais focos recentes são o Parque da Cidade e áreas de cerrado em Planaltina. A recomendação do TCU é intensificar as brigadas.`;
      title = "Situação das Queimadas";
    } 
    else if (p.includes('alagamento') || p.includes('chuva') || p.includes('inundação')) {
      const { rows } = await pool.query("SELECT COUNT(*) FROM ouvidoria WHERE assunto_nome ILIKE '%alagamento%' OR assunto_nome ILIKE '%inunda%'");
      answer = `O banco de dados registra ${rows[0].count} casos de alagamentos graves no momento. Áreas críticas mapeadas pela Defesa Civil incluem Vicente Pires e Sol Nascente. A infraestrutura de escoamento está sendo avaliada pelo Painel Clima.`;
      title = "Alagamentos no DF";
    }
    else if (p.includes('emissão') || p.includes('co2') || p.includes('poluição')) {
      answer = `O Distrito Federal emite cerca de 7,19 milhões de toneladas de CO₂e por ano. O maior responsável é o setor de Energia (Transportes) com 55,3%, seguido por Resíduos Sólidos com 20,6%. Essas são as frentes onde as Políticas Públicas precisam ser mais atuantes segundo o TCU.`;
      title = "Emissões de Gases de Efeito Estufa";
    }
    else if (p.includes('painel') || p.includes('tcu') || p.includes('governo')) {
      answer = `Segundo a auditoria recente do TCU no Painel ClimaBrasil, o Governo do Distrito Federal atingiu 57% de maturidade em Políticas Públicas e 44% em Governança Climática. No entanto, o Financiamento Climático está em nível Inicial (25%). É preciso alocar mais recursos para ações efetivas.`;
      title = "Resultados do Painel Clima TCU";
    }
    else if (p.includes('ouvidoria') || p.includes('reclamar') || p.includes('cobrar')) {
      const { rows } = await pool.query("SELECT COUNT(*) FROM ouvidoria");
      answer = `A Ouvidoria tem ${rows[0].count} manifestações ativas da sociedade sobre o clima. Suas denúncias geram relatórios que o Ministério Público pode autuar e o TCU pode usar para cobrar o governo. Você ganha 50 pontos ESG para cada denúncia qualificada.`;
      title = "Cobrança Social";
    }
    else {
      // General contextual response gathering all macro data
      const { rows } = await pool.query("SELECT COUNT(*) FROM ouvidoria");
      answer = `Temos ${rows[0].count} alertas de cidadãos na nossa rede atualmente. O DF enfrenta desafios com emissões (mais de 7 milhões de toneladas de CO₂) e precisa melhorar o financiamento climático (apenas 25% de maturidade no TCU). Diga 'queimadas', 'alagamentos', ou 'emissões' para mais detalhes reais.`;
      title = "Visão Geral do Clima DF";
    }

    return NextResponse.json({
      title,
      answer
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao gerar resposta com IA' }, { status: 500 });
  }
}
