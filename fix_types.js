const fs = require('fs');
const path = require('path');

function walkDir(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walkDir(file));
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walkDir(path.join(__dirname, 'src'));
let changedFiles = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('const data = await res.json();')) {
    content = content.replace(/const data = await res\.json\(\);/g, 'const data: any = await res.json();');
    fs.writeFileSync(file, content, 'utf8');
    changedFiles++;
  }
});

console.log(`Successfully fixed TypeScript errors in ${changedFiles} files!`);
