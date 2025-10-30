const fs = require('fs');
const path = require('path');

const colorImprovements = [
  // Remover transparencias de backgrounds
  { from: /\bbg-white\/\d+\b/g, to: 'bg-white' },
  { from: /\bbg-muted\/\d+\b/g, to: 'bg-muted' },
  { from: /\bbg-accent\/\d+\b/g, to: 'bg-accent' },
  { from: /\bbg-primary\/\d+\b/g, to: 'bg-primary' },
  { from: /\bbg-card\/\d+\b/g, to: 'bg-card' },
  { from: /\bbg-popover\/\d+\b/g, to: 'bg-popover' },
  { from: /\bbg-background\/\d+\b/g, to: 'bg-background' },
  
  // Mejorar borders con colores sólidos
  { from: /\bborder-gray-100\b/g, to: 'border-border' },
  { from: /\bborder-gray-200\b/g, to: 'border-border' },
  { from: /\bborder-slate-200\b/g, to: 'border-border' },
  
  // Mejorar backgrounds de gradientes genéricos
  { from: /\bbg-gradient-to-br from-slate-50 to-slate-100\b/g, to: 'bg-background' },
  { from: /\bbg-gradient-to-br from-background to-muted\/20\b/g, to: 'bg-background' },
  
  // Mejorar hover states
  { from: /\bhover:bg-muted\/50\b/g, to: 'hover:bg-muted' },
  { from: /\bhover:bg-accent\/50\b/g, to: 'hover:bg-accent' },
  
  // Mejorar cards y modals
  { from: /\bbg-white border-2 border-dashed\b/g, to: 'bg-card border-2 border-dashed border-border' },
];

function improveColors(content) {
  let result = content;
  colorImprovements.forEach(({ from, to }) => {
    result = result.replace(from, to);
  });
  return result;
}

function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const newContent = improveColors(content);
  
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`✓ Updated: ${path.relative(process.cwd(), filePath)}`);
    return true;
  }
  return false;
}

function processDirectory(dir) {
  let count = 0;
  const fullPath = path.join(__dirname, '..', dir);
  
  if (!fs.existsSync(fullPath)) {
    return count;
  }

  function walk(currentPath) {
    const files = fs.readdirSync(currentPath);
    
    files.forEach(file => {
      const filePath = path.join(currentPath, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        walk(filePath);
      } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        if (processFile(filePath)) count++;
      }
    });
  }
  
  walk(fullPath);
  return count;
}

console.log('🎨 Improving color scheme...\n');

const dirs = ['app', 'components'];
let totalUpdated = 0;

dirs.forEach(dir => {
  const updated = processDirectory(dir);
  totalUpdated += updated;
});

console.log(`\n✅ Done! Updated ${totalUpdated} file(s)`);
