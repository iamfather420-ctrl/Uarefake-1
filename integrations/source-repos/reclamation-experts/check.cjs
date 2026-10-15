const fs = require('fs');
const content = fs.readFileSync('src/components/Wallet.tsx', 'utf8');
const lines = content.split('\n');

let tagStack = [];
let rootOpened = false;

for (let i = 380; i < lines.length; i++) {
  const line = lines[i];
  
  const divMatches = Array.from(line.matchAll(/<div[^>]*>|<\/div>/g));
  
  for (const match of divMatches) {
    const isSelfClosing = match[0].endsWith('/>');
    if (isSelfClosing) continue;
    
    if (match[0] === '</div>') {
      if (tagStack.length > 0) {
        tagStack.pop();
        if (tagStack.length === 0 && rootOpened) {
          console.log(`Root completely closed at line ${i+1}`);
          rootOpened = false;
        }
      } else {
        console.log(`Unmatched </div> at line ${i+1}: ${line.trim()}`);
      }
    } else {
      tagStack.push(i + 1);
      rootOpened = true;
    }
  }
}

if (tagStack.length > 0) {
  console.log('Unclosed tags:', tagStack.length);
}
