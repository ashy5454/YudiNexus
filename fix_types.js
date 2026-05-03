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
  
  // This regex matches any variable name: const myData = await myRes.json();
  const regex = /(const|let)\s+(\w+)\s*=\s*await\s+(\w+)\.json\(\);/g;
  
  if (regex.test(content)) {
    const newContent = content.replace(regex, '$1 $2: any = await $3.json();');
    if (content !== newContent) {
      fs.writeFileSync(file, newContent, 'utf8');
      changedFiles++;
    }
  }
});

console.log(`Successfully fixed TypeScript errors in ${changedFiles} files!`);
