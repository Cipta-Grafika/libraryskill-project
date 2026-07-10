const fs = require('fs');

function patchFile(filename) {
  let content = fs.readFileSync(filename, 'utf8');
  
  // Remove pendingImages state
  content = content.replace(/const \[pendingImages,\s*setPendingImages\]\s*=\s*useState<Record<string,\s*File>>\(\{\}\);\n?/g, '');
  
  // Remove onImageAdded prop
  content = content.replace(/onImageAdded=\{\(file, blobUrl\) => \{[\s\S]*?\}\}\n?/g, '');
  
  // Remove upload loop in handleSubmit
  content = content.replace(/\/\/ 1\. Upload any pending offline images[\s\S]*?\/\/ 2\. Submit the skill data/m, '// Submit the skill data');
  
  fs.writeFileSync(filename, content);
}

patchFile('src/app/studio/skills/new/page.tsx');
patchFile('src/app/studio/skills/[id]/edit/page.tsx');
