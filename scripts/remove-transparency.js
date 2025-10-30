const fs = require('fs');
const path = require('path');

const targetDirs = [
  'app/company/[id]/accounts-payable',
  'app/company/[id]/accounts-receivable',
  'app/company/[id]/audit-log',
  'app/company/[id]/clients',
  'app/company/[id]/invoices',
  'app/company/[id]/iva-book',
  'app/company/[id]/load-invoice',
  'app/company/[id]/suppliers',
  'app/company/[id]/dashboard',
  'app/company/[id]/tasks',
  'components'
];

function removeTransparency(content) {
  return content.replace(/\bbg-(\w+)\/\d+\b/g, 'bg-$1');
}

function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const newContent = removeTransparency(content);
  
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`✓ Updated: ${filePath}`);
    return true;
  }
  return false;
}

function processDirectory(dir) {
  let count = 0;
  const fullPath = path.join(__dirname, '..', dir);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠ Directory not found: ${dir}`);
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

console.log('🔄 Removing transparency classes...\n');

let totalUpdated = 0;
targetDirs.forEach(dir => {
  const updated = processDirectory(dir);
  totalUpdated += updated;
});

console.log(`\n✅ Done! Updated ${totalUpdated} file(s)`);
