import fs from 'node:fs';
import path from 'node:path';

const typesDir = path.join(process.cwd(), '.next', 'types');
fs.mkdirSync(typesDir, { recursive: true });

const placeholderPath = path.join(typesDir, 'placeholder.d.ts');
if (!fs.existsSync(placeholderPath)) {
  fs.writeFileSync(placeholderPath, 'export {}\n');
}
