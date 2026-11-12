import { mkdir } from 'node:fs/promises';
import sharp from 'sharp';

await mkdir('assets', { recursive: true });
const icon = await sharp('web/icon-512.png').resize(1024, 1024, { kernel: 'lanczos3' }).png().toBuffer();
const mask = await sharp('web/icon-maskable-512.png').resize(1024, 1024, { kernel: 'lanczos3' }).png().toBuffer();
await sharp(icon).toFile('assets/icon-only.png');
await sharp(mask).toFile('assets/icon-foreground.png');
await sharp({ create: { width: 1024, height: 1024, channels: 4, background: '#06070b' } }).png().toFile('assets/icon-background.png');

const splashSize = 2732;
const logo = await sharp('web/icon-512.png').resize(980, 980).png().toBuffer();
for (const name of ['assets/splash.png', 'assets/splash-dark.png']) {
  await sharp({ create: { width: splashSize, height: splashSize, channels: 4, background: '#06070b' } })
    .composite([{ input: logo, gravity: 'center' }])
    .png()
    .toFile(name);
}
console.log('wrote assets/');
