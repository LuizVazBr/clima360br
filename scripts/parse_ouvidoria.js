const fs = require('fs');
const readline = require('readline');
const path = require('path');

function fixEncoding(str) {
  return str
    .replace(/\uFFFD/g, '?')
    .replace(/Bot\?nico/g, 'Botânico')
    .replace(/Mans\?es/g, 'Mansões')
    .replace(/N\?cleo/g, 'Núcleo')
    .replace(/S\?o/g, 'São')
    .replace(/Bras\?lia/g, 'Brasília')
    .replace(/Ag\?as/g, 'Águas')
    .replace(/Guar\?/g, 'Guará')
    .replace(/Jos\?/g, 'José')
    .replace(/P\?blica/g, 'Pública')
    .replace(/\?rea/g, 'Área')
    .replace(/Ecol\?gico/g, 'Ecológico')
    .replace(/M\?dico/g, 'Médico')
    .replace(/Ind\?stria/g, 'Indústria')
    .replace(/Com\?rcio/g, 'Comércio')
    .replace(/\?/g, ' '); // fallback remove question marks
}

async function processCSV() {
  const fileStream = fs.createReadStream(path.join(__dirname, '../public/manifestacao_extracted/TB_MANIFESTACAO.csv'), 'utf8');

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let totalCount = 0;
  let climateComplaints = [];
  const CLIMATE_IDS = ['1283', '1305', '1585', '972']; 

  let headersSkipped = false;

  for await (const line of rl) {
    if (!headersSkipped) {
      headersSkipped = true;
      continue;
    }
    totalCount++;
    const parts = line.split(';');
    if (parts.length > 3) {
      const assuntoId = parts[3].replace(/"/g, ''); 
      if (CLIMATE_IDS.includes(assuntoId)) {
        let bairro = parts[6] ? parts[6].replace(/"/g, '') : 'Brasília/DF';
        if (bairro === '') bairro = 'Brasília/DF';
        
        climateComplaints.push({
          id: parseInt(parts[0].replace(/"/g, ''), 10) || 0,
          ano: parseInt(parts[1].replace(/"/g, '') || '0', 10),
          assuntoId: assuntoId,
          bairro: fixEncoding(bairro),
          dataAbertura: parts[10] ? parts[10].replace(/"/g, '') : ''
        });
      }
    }
  }

  climateComplaints.sort((a, b) => b.id - a.id);

  const result = {
    totalOuvidorias: totalCount,
    climateTotal: climateComplaints.length,
    recentClimateComplaints: climateComplaints.slice(0, 50) 
  };

  fs.writeFileSync(path.join(__dirname, '../public/ouvidoria_data.json'), JSON.stringify(result, null, 2), 'utf8');
  console.log('Processed! Data written to ouvidoria_data.json');
}

processCSV();
