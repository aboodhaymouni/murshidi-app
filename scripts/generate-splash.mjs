import sharp from 'sharp';
import { readFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const svg = readFileSync(resolve(root, 'icon.svg'));

const drawableBase = resolve(root, 'android/app/src/main/res');

// Splash sizes for each density (portrait, landscape) and the base drawable
const splashTargets = [
  // Base (used by Theme.SplashScreen on older Android)
  { folder: 'drawable',              width: 480,  height: 800,  logo: 220 },

  // Portrait orientation
  { folder: 'drawable-port-mdpi',    width: 320,  height: 480,  logo: 180 },
  { folder: 'drawable-port-hdpi',    width: 480,  height: 800,  logo: 240 },
  { folder: 'drawable-port-xhdpi',   width: 720,  height: 1280, logo: 360 },
  { folder: 'drawable-port-xxhdpi',  width: 960,  height: 1600, logo: 480 },
  { folder: 'drawable-port-xxxhdpi', width: 1280, height: 1920, logo: 600 },

  // Landscape orientation
  { folder: 'drawable-land-mdpi',    width: 480,  height: 320,  logo: 180 },
  { folder: 'drawable-land-hdpi',    width: 800,  height: 480,  logo: 240 },
  { folder: 'drawable-land-xhdpi',   width: 1280, height: 720,  logo: 360 },
  { folder: 'drawable-land-xxhdpi',  width: 1600, height: 960,  logo: 480 },
  { folder: 'drawable-land-xxxhdpi', width: 1920, height: 1280, logo: 600 },
];

async function generateAll() {
  for (const t of splashTargets) {
    const outDir = resolve(drawableBase, t.folder);
    if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

    const logoBuffer = await sharp(svg).resize(t.logo, t.logo).png().toBuffer();

    await sharp({
      create: {
        width: t.width,
        height: t.height,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      },
    })
      .composite([{ input: logoBuffer, gravity: 'center' }])
      .png()
      .toFile(resolve(outDir, 'splash.png'));

    console.log(`✓ ${t.folder}/splash.png (${t.width}×${t.height}, logo ${t.logo}px)`);
  }

  // Also generate a clean splash icon for Android 12+ SplashScreen API
  // This is the icon shown in the system splash (centered, on a colored background)
  const splashIcon = await sharp(svg).resize(512, 512).png().toBuffer();
  await sharp({
    create: { width: 512, height: 512, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: splashIcon, gravity: 'center' }])
    .png()
    .toFile(resolve(drawableBase, 'drawable', 'splash_icon.png'));
  console.log('✓ drawable/splash_icon.png (512×512 transparent — for Android 12+ system splash)');

  console.log('\n✓ All splash images regenerated with Murshidi logo');
}

generateAll().catch((e) => {
  console.error(e);
  process.exit(1);
});
