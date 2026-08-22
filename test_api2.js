async function fetchAQI() {
  const res = await fetch('https://air-quality-api.open-meteo.com/v1/air-quality?latitude=-15.79,-15.83,-15.82,-15.65&longitude=-47.88,-48.06,-48.11,-47.79&current=carbon_monoxide,pm10,pm2_5');
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}
fetchAQI();
