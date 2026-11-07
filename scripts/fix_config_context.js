const fs = require('fs');
const path = require('path');

const contextPath = path.resolve(__dirname, '../frontend/src/context/ConfigContext.tsx');
let code = fs.readFileSync(contextPath, 'utf8');

// 1. Add to interface ConfigContextType
if (!code.includes('joinContent: JoinContentConfig;')) {
  code = code.replace(
    /(setAboutContent:\s*\(config:\s*AboutContentConfig\)\s*=>\s*void;)/,
    '$1\n  joinContent: JoinContentConfig;\n  setJoinContent: (config: JoinContentConfig) => void;'
  );
  console.log('Added joinContent to ConfigContextType via RegExp');
}

fs.writeFileSync(contextPath, code, 'utf8');
console.log('ConfigContext.tsx updated successfully!');
