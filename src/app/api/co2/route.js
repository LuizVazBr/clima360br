import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const locations = [
      { name: 'Brasília (DF)', lat: -15.79, lng: -47.88 },
      { name: 'Guará (DF)', lat: -15.82, lng: -47.97 },
      { name: 'Taguatinga (DF)', lat: -15.83, lng: -48.06 },
      { name: 'Sobradinho (DF)', lat: -15.65, lng: -47.79 },
      { name: 'Planaltina (DF)', lat: -15.45, lng: -47.61 },
      { name: 'Gama (DF)', lat: -16.01, lng: -48.06 }
    ];

    const lats = locations.map(l => l.lat).join(',');
    const lngs = locations.map(l => l.lng).join(',');

    const apiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lats}&longitude=${lngs}&current=european_aqi,carbon_monoxide,pm10,pm2_5`;
    
    const response = await fetch(apiUrl, { next: { revalidate: 3600 } });
    const data = await response.json();

    if (!Array.isArray(data)) {
      return NextResponse.json({ error: 'Erro ao obter dados de qualidade do ar' }, { status: 500 });
    }

    const mappedData = data.map((d, index) => {
      // AQI varia mais que CO, mostrando a realidade local das queimadas de forma mais precisa
      // Se não vier o AQI, usamos PM10 * 10 como proxy de poluição para garantir variação visível
      const aqi = d.current.european_aqi || Math.round(d.current.pm10 * 10) || 50;
      
      return {
        id: index + 1,
        bairro: locations[index].name,
        lat: locations[index].lat,
        lng: locations[index].lng,
        co2_index: aqi, // Agora enviando o AQI real para refletir a variação (0-500)
        pm10: d.current.pm10,
        pm25: d.current.pm2_5,
        updated_at: d.current.time
      };
    });

    return NextResponse.json(mappedData);
  } catch(e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
