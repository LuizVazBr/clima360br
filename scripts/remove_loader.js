const fs = require('fs');
const path = require('path');

const dirs = ['educacao', 'ia-consultor', 'marketplace', 'recuperacao', 'triagem'];

dirs.forEach(d => {
  const file = path.join(__dirname, '..', 'src', 'app', d, 'page.js');
  let content = fs.readFileSync(file, 'utf8');

  // Replace full screen overlay with inline
  content = content.replace(/{\s*loading && \([\s\S]*?<\/[a-zA-Z]+>\s*\)\s*}/g, '');
  content = content.replace(/<div className="table-container glass-panel">/, '<div className="table-container glass-panel">\n        {loading && <div className="inline-loader">Carregando dados...</div>}');
  content = content.replace(/<\/style>/, `  .inline-loader { padding: 16px; text-align: center; color: var(--brand-primary); font-size: 13px; font-weight: 600; }\n      </style>`);

  fs.writeFileSync(file, content);
});
console.log("Loaders removed.");
