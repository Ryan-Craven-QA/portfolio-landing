/**
 * Generates favicons and app icons from the logo mark.
 *   npm run assets:icons
 * Outputs (committed to the repo): public/favicon.svg, favicon.ico,
 * apple-touch-icon.png, icon-192.png, icon-512.png.
 * Keep the paths in sync with src/components/brand/LogoMark.astro.
 */
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const publicDir = fileURLToPath(new URL('../public/', import.meta.url));

const FRAME =
  'M3 8.5v-4A1.5 1.5 0 0 1 4.5 3h4M15.5 3h4A1.5 1.5 0 0 1 21 4.5v4M21 15.5v4a1.5 1.5 0 0 1-1.5 1.5h-4M8.5 21h-4A1.5 1.5 0 0 1 3 19.5v-4';
const INK_DARK = '#f2f0eb';
const INK_LIGHT = '#171613';
const CANVAS = '#0d0c0b';
const ACCENT = '#f47a2c';

// Browser tab icon: adapts to the OS colour scheme.
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
  <style>.f{stroke:${INK_LIGHT}}@media (prefers-color-scheme:dark){.f{stroke:${INK_DARK}}}</style>
  <path class="f" d="${FRAME}" stroke-width="2.2" stroke-linecap="round"/>
  <rect x="7.75" y="7.75" width="8.5" height="8.5" rx="1.75" fill="${ACCENT}"/>
</svg>
`;

// App icons: the mark on a solid canvas tile (no transparency, for iOS/Android).
const tileSvg = (size: number) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24">
  <rect width="24" height="24" fill="${CANVAS}"/>
  <g transform="translate(4.2 4.2) scale(0.65)">
    <path d="${FRAME}" fill="none" stroke="${INK_DARK}" stroke-width="2" stroke-linecap="round"/>
    <rect x="7.75" y="7.75" width="8.5" height="8.5" rx="1.75" fill="${ACCENT}"/>
  </g>
</svg>`;

// Tiny favicon.ico: a single 32×32 PNG wrapped in an ICO container.
function pngToIco(png: Buffer, size: number): Buffer {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // image count
  const entry = Buffer.alloc(16);
  entry.writeUInt8(size, 0); // width
  entry.writeUInt8(size, 1); // height
  entry.writeUInt8(0, 2); // palette
  entry.writeUInt8(0, 3); // reserved
  entry.writeUInt16LE(1, 4); // colour planes
  entry.writeUInt16LE(32, 6); // bits per pixel
  entry.writeUInt32LE(png.length, 8); // data size
  entry.writeUInt32LE(header.length + entry.length, 12); // data offset
  return Buffer.concat([header, entry, png]);
}

async function main() {
  await writeFile(`${publicDir}favicon.svg`, faviconSvg);

  const icoSource = faviconSvg.replace(/<style>.*<\/style>/, '').replace('class="f"', `stroke="${INK_LIGHT}"`);
  const ico32 = await sharp(Buffer.from(icoSource), { density: 400 }).resize(32, 32).png().toBuffer();
  await writeFile(`${publicDir}favicon.ico`, pngToIco(ico32, 32));

  for (const [name, size] of [
    ['apple-touch-icon.png', 180],
    ['icon-192.png', 192],
    ['icon-512.png', 512],
  ] as const) {
    await sharp(Buffer.from(tileSvg(size)), { density: 300 }).resize(size, size).png({ compressionLevel: 9 }).toFile(`${publicDir}${name}`);
  }
  console.log('Icons written to public/: favicon.svg, favicon.ico, apple-touch-icon.png, icon-192.png, icon-512.png');
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
