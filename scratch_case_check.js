const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'client', 'src');

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, "/", file));
    }
  });

  return arrayOfFiles;
}

const allFiles = getAllFiles(srcDir);
const realPaths = allFiles.map(f => f.replace(/\\/g, '/').toLowerCase());
const originalPaths = allFiles.map(f => f.replace(/\\/g, '/'));

const pathMap = new Map();
for(let i=0; i<allFiles.length; i++) {
    pathMap.set(realPaths[i], originalPaths[i]);
}

let mismatches = [];

allFiles.forEach(file => {
    if (file.endsWith('.jsx') || file.endsWith('.js')) {
        const content = fs.readFileSync(file, 'utf-8');
        const importRegex = /import\s+(?:[^"']+from\s+)?["']([^"']+)["']/g;
        let match;
        while ((match = importRegex.exec(content)) !== null) {
            let importPath = match[1];
            if (importPath.startsWith('.')) {
                // resolve it
                const resolved = path.resolve(path.dirname(file), importPath).replace(/\\/g, '/');
                
                // try to find it with extensions
                let found = false;
                const exts = ['', '.js', '.jsx', '.css'];
                for(let ext of exts) {
                    const testPathLower = (resolved + ext).toLowerCase();
                    if (pathMap.has(testPathLower)) {
                        found = true;
                        const realPath = pathMap.get(testPathLower);
                        if (realPath !== (resolved + ext)) {
                            mismatches.push({
                                file: file,
                                importStr: importPath,
                                realPath: realPath,
                                providedPath: resolved + ext
                            });
                        }
                        break;
                    }
                }
            }
        }
    }
});

console.log("Mismatches found:");
console.log(JSON.stringify(mismatches, null, 2));
