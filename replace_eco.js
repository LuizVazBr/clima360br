const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      replaceInDir(fullPath);
    } else if (entry.name.endsWith('.js') || entry.name.endsWith('.css')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('Eco-Points') || content.includes('eco-points') || content.includes('Eco Points')) {
        content = content
          .replace(/Eco-Points/g, 'Clima-Points')
          .replace(/eco-points/g, 'clima-points')
          .replace(/Eco Points/g, 'Clima Points');
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Updated:', fullPath);
      }
    }
  }
}

replaceInDir('src');
console.log('Done.');
