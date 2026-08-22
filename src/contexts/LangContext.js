"use client";
import { createContext, useContext, useState, useEffect } from 'react';

export const TRANSLATIONS = {
  pt: {
    panelControl: 'Painel de Controle', generalPanel: 'Painel Geral', generalPanelDesc: 'Visão do Município e Gastos Previstos',
    dataSources: 'Fontes de Dados', dataSourcesDesc: 'Fontes CEMADEN, INPE, SISDIA',
    configSettings: 'Configurações e Uploads', configSettingsDesc: 'Ajuste o mapa e atualize os CSVs',
    alertsMap: 'Mapa de Alertas', alertsMapDesc: 'Riscos na minha região',
    educaClima: 'Educa Clima 360', educaClimaDesc: 'Cursos, pontos e descontos ESG',
    cobrarGoverno: 'Cobrar o Governo', cobrarGovernoDesc: 'Fotografar e cobrar ação imediata',
    totemAtendimento: 'Totem de Atendimento', totemAtendimentoDesc: 'Voz e temas sobre políticas do DF',
    whatsappBot: 'Bot WhatsApp', whatsappBotDesc: 'Acesso via WhatsApp sem dashboard',
    apiKeys: 'Chaves de IA', apiKeysDesc: 'OpenAI, Claude, Gemini',
    gestor: 'Gestor Público', cidadao: 'Cidadão', tcu: 'TCU', auditor: 'Auditor',
    welcomeCidadao: 'Educa Clima 360 — Área do Cidadão', welcomeCidadaoDesc: 'Gamificação, cobranças e acompanhamento ESG da sua região.',
    welcomeTcu: 'Painel de Controle TCU', welcomeTcuDesc: 'Acompanhamento de demandas da sociedade e falhas governamentais.',
    welcomeAuditor: 'Otimização de Auditoria', welcomeAuditorDesc: 'Busca ativa em fontes oficiais e cruzamento de gastos climáticos.',
    loading: 'Carregando...', points: 'pontos', courses: 'Cursos ESG',
    discounts: 'Descontos Disponíveis', redeem: 'Resgatar', partners: 'Parceiros ESG',
    registerPartner: '+ Cadastrar Novo Parceiro ESG', configTitle: 'Configurações do Sistema',
    mapLocation: 'Localização Inicial do Mapa', saveCoords: 'Salvar Coordenadas', uploadHistory: 'Histórico de Atualizações',
    chatTitle: 'Assistente Clima 360', chatGreeting: 'Olá! Sou o Assistente Clima 360. Posso ajudar com informações climáticas.',
    myEsgPanel: 'Educa Clima 360 — Meu Painel ESG', esgPointsDesc: 'Seus pontos ESG acumulados',
    sentDemands: 'Cobranças enviadas', completedCourses: 'Cursos concluídos', resolvedTcu: 'Resolvidas (TCU)',
    simulateDemand: 'Simulação Cobrar o Governo', simDesc: 'Teste como o cidadão fotografa e envia',
    tcuOccurrences: 'Ocorrências na Ouvidoria', tcuNoOccurrences: 'Nenhuma ocorrência registrada.',
    tcuEvolution: 'Evolução dos Eixos (DF)', tcuRecent: 'Ocorrências Recentes',
    transparencyPortal: 'Portal da Transparência', expectedFund: 'Fundo Previsto', spentFund: 'Fundo Gasto',
    docsAnalysis: 'Análise de Documentos (IA)', noDocs: 'Nenhum documento anômalo detectado.',
    c1: 'Como cobrar ações do Governo', c2: 'O que é o Painel ClimaBrasil?', c3: 'Direitos em áreas de risco',
    c4: 'Resíduos e separação correta', c5: 'Como reduzir pegada de carbono',
    searchMap: 'Buscar local ou bairro...',
    sidebarTimeline: 'Timeline', sidebarAlerts: 'Alertas', sidebarStats: 'Estatísticas',
    feedUpdates: 'Feed de Atualizações', myAlerts: 'Meus Alertas',
    riskFlood: 'Risco de Inundação', civilDefense: 'Defesa Civil', 
    floodDesc: 'Nível crítico de chuvas detectado. Probabilidade de alagamento nas próximas 2 horas.',
    statsTitle: 'Métricas Principais (DF)',
    mapLayers: 'Camadas Climáticas', heatmap: 'Mapa de Calor', ombudsman: 'Ouvidoria',
    riskAreas: 'Áreas de Risco', fireSpots: 'Focos de Incêndio', civilDefenseLayer: 'Defesa Civil',
    satellite: 'Satélite', hybrid: 'Híbrido', light: 'Light', dark: 'Dark',
    noNotifications: 'Sem notificações', upToDate: 'Você está em dia com os alertas.',
    typeQuestion: 'Digite sua dúvida...',
    "Governança Climática": 'Governança Climática',
    "Políticas Públicas": 'Políticas Públicas',
    "Financiamento Climático": 'Financiamento Climático',
    tcuDemands: 'Demandas', tcuDemandsDesc: 'Acompanhamento de processos',
    societyDemands: 'Demandas da Sociedade', societyDemandsDesc: 'Reclamações diretas de cidadãos'
  },
  en: {
    panelControl: 'Control Panel', generalPanel: 'General Panel', generalPanelDesc: 'Municipal View and Planned Spending',
    dataSources: 'Data Sources', dataSourcesDesc: 'CEMADEN, INPE, SISDIA Sources',
    configSettings: 'Settings & Uploads', configSettingsDesc: 'Adjust map and update CSVs',
    alertsMap: 'Alerts Map', alertsMapDesc: 'Risks in my region',
    educaClima: 'Educa Clima 360', educaClimaDesc: 'Courses, points and ESG discounts',
    cobrarGoverno: 'Hold Gov Accountable', cobrarGovernoDesc: 'Photograph and demand action',
    totemAtendimento: 'Service Kiosk', totemAtendimentoDesc: 'Voice and topics about DF policies',
    whatsappBot: 'WhatsApp Bot', whatsappBotDesc: 'Access via WhatsApp without a dashboard',
    apiKeys: 'AI Keys', apiKeysDesc: 'OpenAI, Claude, Gemini',
    gestor: 'Public Manager', cidadao: 'Citizen', tcu: 'TCU', auditor: 'Auditor',
    welcomeCidadao: 'Educa Clima 360 — Citizen Area', welcomeCidadaoDesc: 'Gamification, demands and ESG tracking for your region.',
    welcomeTcu: 'TCU Control Panel', welcomeTcuDesc: 'Monitoring of society demands and governmental failures.',
    welcomeAuditor: 'Audit Optimization', welcomeAuditorDesc: 'Active search in official sources and climate spending analysis.',
    loading: 'Loading...', points: 'points', courses: 'ESG Courses',
    discounts: 'Available Discounts', redeem: 'Redeem', partners: 'ESG Partners',
    registerPartner: '+ Register New ESG Partner', configTitle: 'System Settings',
    mapLocation: 'Map Initial Location', saveCoords: 'Save Coordinates', uploadHistory: 'Upload History',
    chatTitle: 'Clima 360 Assistant', chatGreeting: 'Hello! I am the Clima 360 Assistant. I can help with climate information.',
    myEsgPanel: 'Educa Clima 360 — My ESG Panel', esgPointsDesc: 'Your accumulated ESG points',
    sentDemands: 'Sent Demands', completedCourses: 'Completed Courses', resolvedTcu: 'Resolved (TCU)',
    simulateDemand: 'Demand Government Simulation', simDesc: 'Test how citizens report issues',
    tcuOccurrences: 'Ombudsman Occurrences', tcuNoOccurrences: 'No occurrences registered.',
    tcuEvolution: 'Axis Evolution (DF)', tcuRecent: 'Recent Occurrences',
    transparencyPortal: 'Transparency Portal', expectedFund: 'Expected Fund', spentFund: 'Spent Fund',
    docsAnalysis: 'AI Document Analysis', noDocs: 'No anomalous documents detected.',
    c1: 'How to demand Government actions', c2: 'What is ClimaBrasil Panel?', c3: 'Rights in risk areas',
    c4: 'Waste and correct separation', c5: 'How to reduce carbon footprint',
    searchMap: 'Search location or neighborhood...',
    sidebarTimeline: 'Timeline', sidebarAlerts: 'Alerts', sidebarStats: 'Statistics',
    feedUpdates: 'Update Feed', myAlerts: 'My Alerts',
    riskFlood: 'Flood Risk', civilDefense: 'Civil Defense', 
    floodDesc: 'Critical rain levels detected. High probability of flooding in the next 2 hours.',
    statsTitle: 'Key Metrics (DF)',
    mapLayers: 'Climate Layers', heatmap: 'Heatmap', ombudsman: 'Ombudsman',
    riskAreas: 'Risk Areas', fireSpots: 'Fire Spots', civilDefenseLayer: 'Civil Defense',
    satellite: 'Satellite', hybrid: 'Hybrid', light: 'Light', dark: 'Dark',
    noNotifications: 'No notifications', upToDate: 'You are up to date with alerts.',
    typeQuestion: 'Type your question...',
    "Governança Climática": 'Climate Governance',
    "Políticas Públicas": 'Public Policies',
    "Financiamento Climático": 'Climate Financing',
    tcuDemands: 'TCU Demands', tcuDemandsDesc: 'Process tracking',
    societyDemands: 'Society Demands', societyDemandsDesc: 'Direct citizen complaints'
  },
  es: {
    panelControl: 'Panel de Control', generalPanel: 'Panel General', generalPanelDesc: 'Vista Municipal y Gastos Planificados',
    dataSources: 'Fuentes de Datos', dataSourcesDesc: 'Fuentes CEMADEN, INPE, SISDIA',
    configSettings: 'Configuraciones y Cargas', configSettingsDesc: 'Ajustar mapa y actualizar CSVs',
    alertsMap: 'Mapa de Alertas', alertsMapDesc: 'Riesgos en mi región',
    educaClima: 'Educa Clima 360', educaClimaDesc: 'Cursos, puntos y descuentos ESG',
    cobrarGoverno: 'Exigir al Gobierno', cobrarGovernoDesc: 'Fotografiar y exigir acción',
    totemAtendimento: 'Tótem de Atención', totemAtendimentoDesc: 'Voz y temas sobre políticas',
    whatsappBot: 'Bot WhatsApp', whatsappBotDesc: 'Acceso vía WhatsApp sin panel',
    apiKeys: 'Claves de IA', apiKeysDesc: 'OpenAI, Claude, Gemini',
    gestor: 'Gestor Público', cidadao: 'Ciudadano', tcu: 'TCU', auditor: 'Auditor',
    welcomeCidadao: 'Educa Clima 360 — Área del Ciudadano', welcomeCidadaoDesc: 'Gamificación, demandas y seguimiento ESG de tu región.',
    welcomeTcu: 'Panel de Control TCU', welcomeTcuDesc: 'Seguimiento de demandas de la sociedad y fallos.',
    welcomeAuditor: 'Optimización de Auditoría', welcomeAuditorDesc: 'Búsqueda en fuentes oficiales y análisis de gastos.',
    loading: 'Cargando...', points: 'puntos', courses: 'Cursos ESG',
    discounts: 'Descuentos', redeem: 'Canjear', partners: 'Socios ESG',
    registerPartner: '+ Registrar Nuevo Socio ESG', configTitle: 'Configuración del Sistema',
    mapLocation: 'Ubicación Inicial del Mapa', saveCoords: 'Guardar Coordenadas', uploadHistory: 'Historial',
    chatTitle: 'Asistente Clima 360', chatGreeting: '¡Hola! Soy el Asistente Clima 360. Puedo ayudar.',
    myEsgPanel: 'Educa Clima 360 — Mi Panel ESG', esgPointsDesc: 'Tus puntos ESG acumulados',
    sentDemands: 'Demandas enviadas', completedCourses: 'Cursos completados', resolvedTcu: 'Resueltas (TCU)',
    simulateDemand: 'Simulación Exigir al Gobierno', simDesc: 'Prueba cómo los ciudadanos reportan problemas',
    tcuOccurrences: 'Ocurrencias en Defensoría', tcuNoOccurrences: 'Ninguna ocurrencia registrada.',
    tcuEvolution: 'Evolución de Ejes (DF)', tcuRecent: 'Ocurrencias Recientes',
    transparencyPortal: 'Portal de Transparencia', expectedFund: 'Fondo Previsto', spentFund: 'Fondo Gastado',
    docsAnalysis: 'Análisis de Documentos (IA)', noDocs: 'Ningún documento anómalo detectado.',
    c1: 'Cómo exigir acciones del Gobierno', c2: '¿Qué es el Panel ClimaBrasil?', c3: 'Derechos en áreas de riesgo',
    c4: 'Residuos y separación correcta', c5: 'Cómo reducir la huella de carbono',
    searchMap: 'Buscar ubicación o barrio...',
    sidebarTimeline: 'Timeline', sidebarAlerts: 'Alertas', sidebarStats: 'Estadísticas',
    feedUpdates: 'Feed de Actualizaciones', myAlerts: 'Mis Alertas',
    riskFlood: 'Riesgo de Inundación', civilDefense: 'Defensa Civil', 
    floodDesc: 'Niveles críticos de lluvia detectados. Probabilidad de inundación en las próximas 2 horas.',
    statsTitle: 'Métricas Principales (DF)',
    mapLayers: 'Capas Climáticas', heatmap: 'Mapa de Calor', ombudsman: 'Defensoría',
    riskAreas: 'Áreas de Riesgo', fireSpots: 'Focos de Incendio', civilDefenseLayer: 'Defensa Civil',
    satellite: 'Satélite', hybrid: 'Híbrido', light: 'Light', dark: 'Dark',
    noNotifications: 'Sin notificaciones', upToDate: 'Estás al día con las alertas.',
    typeQuestion: 'Escribe tu duda...',
    "Governança Climática": 'Gobernanza Climática',
    "Políticas Públicas": 'Políticas Públicas',
    "Financiamento Climático": 'Financiamiento Climático',
    tcuDemands: 'Demandas del TCU', tcuDemandsDesc: 'Seguimiento de procesos',
    societyDemands: 'Demandas de Sociedad', societyDemandsDesc: 'Quejas ciudadanas directas'
  }
};

const LangContext = createContext({ lang: 'pt', setLang: () => {}, t: (k) => k });

export function LangProvider({ children }) {
  const [lang, setLangState] = useState('pt');

  useEffect(() => {
    const saved = localStorage.getItem('clima360-lang');
    if (saved && TRANSLATIONS[saved]) setLangState(saved);
  }, []);

  const setLang = (l) => {
    setLangState(l);
    localStorage.setItem('clima360-lang', l);
  };

  const t = (key) => TRANSLATIONS[lang]?.[key] || TRANSLATIONS['pt'][key] || key;

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
