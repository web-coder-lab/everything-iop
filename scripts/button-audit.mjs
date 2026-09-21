import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
let ts;
try { ts = require('typescript'); } catch { ts = require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js'); }

const roots = ['src'];
const files = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory() && !['node_modules', 'dist', 'dist-server', '.git'].includes(entry.name)) walk(file);
    else if (entry.isFile() && file.endsWith('.tsx')) files.push(file);
  }
}
roots.forEach(walk);
let total = 0;
const missing = [];
for (const file of files) {
  const source = fs.readFileSync(file, 'utf8');
  const sf = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const visit = (node) => {
    if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
      const opening = ts.isJsxElement(node) ? node.openingElement : node;
      if (opening.tagName.getText(sf) === 'button') {
        total += 1;
        const attrs = [...opening.attributes.properties];
        const hasClick = attrs.some((a) => ts.isJsxAttribute(a) && a.name.getText(sf) === 'onClick');
        const type = attrs.find((a) => ts.isJsxAttribute(a) && a.name.getText(sf) === 'type');
        const disabled = attrs.some((a) => ts.isJsxAttribute(a) && a.name.getText(sf) === 'disabled');
        if (!(hasClick || type?.initializer?.getText(sf) === '"submit"' || disabled)) {
          const { line } = sf.getLineAndCharacterOfPosition(opening.getStart(sf));
          missing.push(`${file}:${line + 1}`);
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
}
console.log(`BUTTON_AUDIT total=${total} actionable_or_disabled=${total - missing.length} missing=${missing.length}`);
if (missing.length) {
  console.error(missing.join('\n'));
  process.exit(1);
}
