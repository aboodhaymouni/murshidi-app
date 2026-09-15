import sharp from 'sharp';
import { readFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const svg = readFileSync(resolve(root, 'icon.svg'));
const androidRes = resolve(root, 'android/app/src/main/res');

// Android mipmap densities (foreground icon size on each)
const sizes = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192,
};

const files = ['ic_launcher.png', 'ic_launcher_round.png', 'ic_launcher_foreground.png'];

async function generateAll() {
  // Standard launcher icons (full bleed, square w/ rounded corners baked in)
  for (const [folder, size] of Object.entries(sizes)) {
    const outDir = resolve(androidRes, folder);
    if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

    // ic_launcher.png — square (will be masked by Android)
    await sharp(svg)
      .resize(size, size)
      .png()
      .toFile(resolve(outDir, 'ic_launcher.png'));

    // ic_launcher_round.png — same content, will be auto-masked
    await sharp(svg)
      .resize(size, size)
      .png()
      .toFile(resolve(outDir, 'ic_launcher_round.png'));

    // ic_launcher_foreground.png — adaptive icon foreground (with safe area padding)
    // Android adaptive icons are 108dp; the visible area is 72dp (66.6% of viewport)
    const fgSize = Math.round(size * 1.5);
    await sharp(svg)
      .resize(Math.round(fgSize * 0.7), Math.round(fgSize * 0.7))
      .extend({
        top: Math.round(fgSize * 0.15),
        bottom: Math.round(fgSize * 0.15),
        left: Math.round(fgSize * 0.15),
        right: Math.round(fgSize * 0.15),
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toFile(resolve(outDir, 'ic_launcher_foreground.png'));

    console.log(`✓ ${folder} (${size}px)`);
  }

  // Generate splash icon for the web preview & app
  const publicDir = resolve(root, 'public');
  if (!existsSync(publicDir)) mkdirSync(publicDir, { recursive: true });
  await sharp(svg).resize(512, 512).png().toFile(resolve(publicDir, 'icon-512.png'));
  await sharp(svg).resize(192, 192).png().toFile(resolve(publicDir, 'icon-192.png'));
  await sharp(svg).resize(32, 32).png().toFile(resolve(publicDir, 'favicon.png'));

  console.log('✓ public/icon-{192,512}.png + favicon');

  // Adaptive icon background (solid color)
  const bgColorXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#013070</color>
</resources>
`;
  const valuesDir = resolve(androidRes, 'values');
  if (!existsSync(valuesDir)) mkdirSync(valuesDir, { recursive: true });
  // Write color file
  const fs = await import('fs/promises');
  await fs.writeFile(resolve(valuesDir, 'ic_launcher_background.xml'), bgColorXml);
  console.log('✓ ic_launcher_background.xml');
}

generateAll().catch((e) => {
  console.error(e);
  process.exit(1);
});
