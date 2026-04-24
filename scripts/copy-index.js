import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const source = path.resolve(__dirname, '../index.html');
const dest = path.resolve(__dirname, '../dist/client/index.html');

if (fs.existsSync(source)) {
  fs.copyFileSync(source, dest);
  console.log('✓ Copied index.html to dist/client/');
} else {
  console.log('⚠ index.html not found, skipping copy');
}
