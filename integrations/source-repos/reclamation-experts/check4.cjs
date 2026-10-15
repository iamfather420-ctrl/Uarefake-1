const fs = require('fs');
const content = fs.readFileSync('src/components/Wallet.tsx', 'utf8');
const lines = content.split('\n');

let depth = 0;

for (let i = 380; i < 510; i++) {
  const line = lines[i];
  
  const divMatches = Array.from(line.matchAll(/<div[^>]*>|<\/div>/g));
  
  for (const match of divMatches) {
    const isSelfClosing = match[0].endsWith('/>');
    if (isSelfClosing) continue;
    
    if (match[0] === '</div>') {
      depth--;
      console.log(`L${i+1} CLOSE: depth -> ${depth}`);
    } else {
      depth++;
      console.log(`L${i+1} OPEN: depth -> ${depth}`);
    }
  }
}

console.log('Final depth:', depth);
