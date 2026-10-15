const fs = require('fs');
const content = fs.readFileSync('src/components/Wallet.tsx', 'utf8');

// replace all newlines inside tags so we can match them easily
let safeContent = '';
let inTag = false;
for (let i = 0; i < content.length; i++) {
  if (content[i] === '<') inTag = true;
  if (content[i] === '>') inTag = false;
  if (inTag && content[i] === '\n') {
    safeContent += ' ';
  } else {
    safeContent += content[i];
  }
}

const lines = safeContent.split('\n');

let depth = 0;
let events = [];

for (let i = 381; i <= 1367; i++) { // From start of return statement
  const line = lines[i];
  if (!line) continue;
  
  const divMatches = Array.from(line.matchAll(/<div(\s+[^>]*?)?>|<\/div>/g));
  
  for (const match of divMatches) {
    const isSelfClosing = match[0].endsWith('/>');
    if (isSelfClosing) continue;
    
    if (match[0] === '</div>') {
      depth--;
      if (depth <= 0) {
        console.log(`ROOT CLOSED! Line ${i+1}: ${match[0]}, Depth became ${depth}`);
      }
    } else {
      depth++;
    }
  }
}

console.log('Final absolute depth at 1367:', depth);
