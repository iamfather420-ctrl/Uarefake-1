const fs = require('fs');
const content = fs.readFileSync('src/components/Wallet.tsx', 'utf8');
const lines = content.split('\n');

let tagStack = [];

for (let i = 380; i <= 507; i++) {
  const line = lines[i];
  
  const divMatches = Array.from(line.matchAll(/<div[^>]*>|<\/div>/g));
  
  for (const match of divMatches) {
    const isSelfClosing = match[0].endsWith('/>');
    if (isSelfClosing) continue;
    
    if (match[0] === '</div>') {
      const popped = tagStack.pop();
      console.log(`Line ${i+1}: popped ${popped}`);
    } else {
      tagStack.push(i + 1);
      console.log(`Line ${i+1}: pushed ${i+1}`);
    }
  }
}
