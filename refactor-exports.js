const fs = require('fs');
const path = require('path');

function walkSync(dir, filelist = []) {
  if (!fs.existsSync(dir)) return filelist;
  const files = fs.readdirSync(dir);
  files.forEach(function(file) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
        filelist = walkSync(fullPath, filelist);
      }
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        filelist.push(fullPath);
      }
    }
  });
  return filelist;
}

const dirsToScan = ['c:/Desktop/pos-next/components', 'c:/Desktop/pos-next/app'];
let allFiles = [];
dirsToScan.forEach(dir => {
  allFiles = walkSync(dir, allFiles);
});

const exportsMap = {}; // path -> component name

allFiles.forEach(file => {
  // skip Next.js special files and API routes
  if (file.endsWith('page.tsx') || file.endsWith('layout.tsx') || file.includes('/api/') || file.includes('\\api\\')) return;
  
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  
  // Replace: export default function Name
  content = content.replace(/export\s+default\s+function\s+([A-Za-z0-9_]+)/g, (match, name) => {
    exportsMap[file] = name;
    changed = true;
    return `export function ${name}`;
  });
  
  // Replace: export default Name;
  content = content.replace(/^export\s+default\s+([A-Za-z0-9_]+);?$/gm, (match, name) => {
    exportsMap[file] = name;
    changed = true;
    // Check if `export const ${name}` already exists
    if (content.includes(`export const ${name}`) || content.includes(`export function ${name}`) || content.includes(`export class ${name}`)) {
        return `// export default removed (named export already exists)`;
    }
    return `export { ${name} };`;
  });

  if (changed) {
    fs.writeFileSync(file, content);
    console.log(`Refactored exports in: ${file} (Exporting: ${exportsMap[file]})`);
  }
});

console.log(`Found ${Object.keys(exportsMap).length} files to refactor imports for.`);

// Now update all imports across the whole project
let allProjectFiles = walkSync('c:/Desktop/pos-next', []);
let replacements = 0;

allProjectFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  
  Object.keys(exportsMap).forEach(exportFile => {
    const compName = exportsMap[exportFile];
    const basename = path.basename(exportFile, path.extname(exportFile));
    
    // We need to match: import ComponentName from ".../ComponentName"
    // Be careful not to replace already named imports like import { ComponentName } from
    // Match `import Name from` and `import Name, { Other } from`
    
    // Simple regex for `import Name from '...name'`
    // Note: this could be brittle, but it's a good first pass
    const regex1 = new RegExp(`import\\s+${compName}\\s+from\\s+["']([^"']*${basename}?)["']`, 'g');
    content = content.replace(regex1, (match, importPath) => {
      changed = true;
      replacements++;
      return `import { ${compName} } from "${importPath}"`;
    });

    // Handle single line multiple imports: import Name, { Something } from ...
    const regex2 = new RegExp(`import\\s+${compName}\\s*,\\s*\\{([^}]+)\\}\\s+from\\s+["']([^"']*${basename}?)["']`, 'g');
    content = content.replace(regex2, (match, otherImports, importPath) => {
      changed = true;
      replacements++;
      return `import { ${compName}, ${otherImports.trim()} } from "${importPath}"`;
    });
  });

  if (changed) {
    fs.writeFileSync(file, content);
    console.log(`Updated imports in: ${file}`);
  }
});

console.log("Total updated imports:", replacements);
