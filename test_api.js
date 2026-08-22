async function fetchAQI() {
  const res = await fetch('https://air-quality-api.open-meteo.com/v1/air-quality?latitude=-15.78&longitude=-47.93&current=pm10,pm2_5,carbon_monoxide');
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}
fetchAQI();
