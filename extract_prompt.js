const fs = require('fs');
const lines = fs.readFileSync('C:/Users/aryan/.gemini/antigravity-ide/brain/c72ba481-1818-4209-a8a1-bf0e6ec6aaea/.system_generated/logs/transcript.jsonl', 'utf-8').trim().split('\n');
const userLines = lines.filter(l => l.includes('"type":"USER_INPUT"'));
if(userLines.length > 0) {
  const lastLine = userLines[userLines.length - 1];
  const parsed = JSON.parse(lastLine);
  fs.writeFileSync('last_prompt.txt', parsed.content, 'utf-8');
  console.log('Saved to last_prompt.txt');
}
