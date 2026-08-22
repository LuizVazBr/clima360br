/**
 * Arquitetura de ingestão de dados externos (mock/estrutura para o Clima360)
 * Padroniza os retornos das diversas fontes climáticas para a interface.
 */

// Simula busca no INMET (Previsão, Temperatura, Chuva, Avisos)
export async function fetchInmetData(cityCode) {
  // Mock data structure
  return {
    source: 'INMET',
    timestamp: new Date().toISOString(),
    data: {
      temperature: 28,
      precipitation_prob: 40,
      alerts: ['Aviso de Chuvas Intensas']
    }
  };
}

// Simula busca no CEMADEN (Alertas hidrológicos e geológicos)
export async function fetchCemadenAlerts(cityCode) {
  return {
    source: 'CEMADEN',
    timestamp: new Date().toISOString(),
    data: {
      flood_risk: 'ALTO',
      landslide_risk: 'MÉDIO',
      active_alerts: 1
    }
  };
}

// Simula busca no INPE (Programa Queimadas)
export async function fetchInpeFires(cityCode) {
  return {
    source: 'INPE',
    timestamp: new Date().toISOString(),
    data: {
      fire_spots_24h: 12,
      fire_risk: 'CRÍTICO'
    }
  };
}

// Simula busca na NASA (Imagens de satélite / Dados Geoespaciais)
export async function fetchNasaData(bbox) {
  return {
    source: 'NASA',
    timestamp: new Date().toISOString(),
    data: {
      layer_url: 'https://gibs.earthdata.nasa.gov/wmts/...',
      description: 'Observação da Terra - Camada de Temperatura'
    }
  };
}

// Simula busca na ANA (Dados Hidrológicos)
export async function fetchAnaData(cityCode) {
  return {
    source: 'ANA',
    timestamp: new Date().toISOString(),
    data: {
      reservoir_level: 45.2, // porcentagem
      drought_index: 'Severa'
    }
  };
}

// Simula busca no MapBiomas (Cobertura e Uso da Terra)
export async function fetchMapBiomasData(cityCode) {
  return {
    source: 'MapBiomas',
    timestamp: new Date().toISOString(),
    data: {
      forest_cover_percent: 32.5,
      deforestation_alert: true
    }
  };
}

// Simula busca no Portal da Transparência (Financiamento Público)
export async function fetchTransparenciaFinance(cityCode) {
  return {
    source: 'Portal da Transparência',
    timestamp: new Date().toISOString(),
    data: {
      climate_funds_received: 1500000,
      active_contracts: 3
    }
  };
}
