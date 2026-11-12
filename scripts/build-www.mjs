import { cp, rm, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const www = join(root, 'www');
await rm(www, { recursive: true, force: true });
await cp(join(root, 'web'), www, { recursive: true });
const envPath = join(www, 'js', 'env.js');
const env = await readFile(envPath, 'utf8');
if (!env.includes('window.__A21_PROD = false')) {
  throw new Error('env.js no longer has the production flag this script replaces');
}
await writeFile(envPath, env.replace('window.__A21_PROD = false', 'window.__A21_PROD = true'));
console.log('wrote production web bundle to www/');
