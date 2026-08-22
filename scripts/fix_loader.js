const fs = require('fs');
const path = require('path');

const dirs = ['educacao', 'ia-consultor', 'marketplace', 'recuperacao', 'triagem'];

dirs.forEach(d => {
  const file = path.join(__dirname, '..', 'src', 'app', d, 'page.js');
  let content = fs.readFileSync(file, 'utf8');

  // Fix the syntax error from the previous regex
  content = content.replace(/`}  \.inline-loader {/g, '  .inline-loader {');
  content = content.replace(/<\/style>/g, '`}</style>');

  fs.writeFileSync(file, content);
});
console.log("Syntax fixed.");
