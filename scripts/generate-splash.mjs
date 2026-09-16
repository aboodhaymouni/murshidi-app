import sharp from 'sharp';
import { readFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const svg = readFileSync(resolve(root, 'icon.svg'));

const drawableBase = resolve(root, 'android/app/src/main/res');

// Fraction of the SHORT edge the lockup occupies on the legacy full-bleed
// splash. The Capacitor SplashScreen plugin draws these with CENTER_CROP, which
// scales the short edge up to fill the device, so the on-screen size ends up
// around a third of the screen width — matching BrandSplash on the web
// (132px mark on a 390px viewport).
const LEGACY_LOGO_RATIO = 0.24;

// Android 12+ SplashScreen API: an icon with no background is laid out on a
// 288dp canvas with only the inner ~2/3 guaranteed visible. The lockup is a
// full-bleed rounded square, so drawing it edge-to-edge gets its wordmark
// clipped by the system mask. Keep it inside the safe area instead.
const SPLASH_ICON_CANVAS = 512;
const SPLASH_ICON_SAFE = Math.round(SPLASH_ICON_CANVAS * (2 / 3)); // 341px

// Splash canvases for each density (portrait, landscape) and the base drawable.
const splashTargets = [
  // Base (used by Theme.SplashScreen on older Android)
  { folder: 'drawable',              width: 480,  height: 800  },

  // Portrait orientation
  { folder: 'drawable-port-mdpi',    width: 320,  height: 480  },
  { folder: 'drawable-port-hdpi',    width: 480,  height: 800  },
  { folder: 'drawable-port-xhdpi',   width: 720,  height: 1280 },
  { folder: 'drawable-port-xxhdpi',  width: 960,  height: 1600 },
  { folder: 'drawable-port-xxxhdpi', width: 1280, height: 1920 },

  // Landscape orientation
  { folder: 'drawable-land-mdpi',    width: 480,  height: 320  },
  { folder: 'drawable-land-hdpi',    width: 800,  height: 480  },
  { folder: 'drawable-land-xhdpi',   width: 1280, height: 720  },
  { folder: 'drawable-land-xxhdpi',  width: 1600, height: 960  },
  { folder: 'drawable-land-xxxhdpi', width: 1920, height: 1280 },
];

async function generateAll() {
  for (const target of splashTargets) {
    const outDir = resolve(drawableBase, target.folder);
    if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

    const logo = Math.round(Math.min(target.width, target.height) * LEGACY_LOGO_RATIO);
    const logoBuffer = await sharp(svg).resize(logo, logo).png().toBuffer();

    await sharp({
      create: {
        width: target.width,
        height: target.height,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      },
    })
      .composite([{ input: logoBuffer, gravity: 'center' }])
      .png()
      .toFile(resolve(outDir, 'splash.png'));

    console.log(`OK ${target.folder}/splash.png (${target.width}x${target.height}, logo ${logo}px)`);
  }

  // Android 12+ system splash icon — transparent canvas, lockup inside the safe area.
  const safeIcon = await sharp(svg).resize(SPLASH_ICON_SAFE, SPLASH_ICON_SAFE).png().toBuffer();
  await sharp({
    create: {
      width: SPLASH_ICON_CANVAS,
      height: SPLASH_ICON_CANVAS,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: safeIcon, gravity: 'center' }])
    .png()
    .toFile(resolve(drawableBase, 'drawable', 'splash_icon.png'));
  console.log(
    `OK drawable/splash_icon.png (${SPLASH_ICON_CANVAS}x${SPLASH_ICON_CANVAS} transparent, ` +
    `lockup ${SPLASH_ICON_SAFE}px inside the Android 12+ safe area)`,
  );

  console.log('\nAll splash images regenerated from icon.svg');
}

generateAll().catch((e) => {
  console.error(e);
  process.exit(1);
});
