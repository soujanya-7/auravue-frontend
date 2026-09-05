const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const assetsDir = path.join(__dirname, '..', 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

const logoPath = path.join(__dirname, '..', 'public', 'logo512.png');

async function createAssets() {
  console.log('Generating base assets for Capacitor...');
  
  // 1. Icon Background (Dark obsidian #050b11)
  const bgBuffer = await sharp({
    create: {
      width: 1024,
      height: 1024,
      channels: 4,
      background: { r: 5, g: 11, b: 17, alpha: 1 }
    }
  }).png().toBuffer();
  fs.writeFileSync(path.join(assetsDir, 'icon-background.png'), bgBuffer);

  // 2. Icon Only / Foreground (Logo centered on transparent or dark background)
  if (fs.existsSync(logoPath)) {
    const resizedLogo = await sharp(logoPath)
      .resize(700, 700, { fit: 'inside' })
      .toBuffer();

    const iconOnly = await sharp({
      create: {
        width: 1024,
        height: 1024,
        channels: 4,
        background: { r: 5, g: 11, b: 17, alpha: 1 }
      }
    })
    .composite([{ input: resizedLogo, gravity: 'center' }])
    .png()
    .toBuffer();

    fs.writeFileSync(path.join(assetsDir, 'icon-only.png'), iconOnly);
    
    // Foreground with transparent background
    const iconFg = await sharp({
      create: {
        width: 1024,
        height: 1024,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
    .composite([{ input: resizedLogo, gravity: 'center' }])
    .png()
    .toBuffer();

    fs.writeFileSync(path.join(assetsDir, 'icon-foreground.png'), iconFg);
  }

  // 3. Splash Screen (2732x2732 centered on #050b11)
  if (fs.existsSync(logoPath)) {
    const splashLogo = await sharp(logoPath)
      .resize(1000, 1000, { fit: 'inside' })
      .toBuffer();

    const splash = await sharp({
      create: {
        width: 2732,
        height: 2732,
        channels: 4,
        background: { r: 5, g: 11, b: 17, alpha: 1 }
      }
    })
    .composite([{ input: splashLogo, gravity: 'center' }])
    .png()
    .toBuffer();

    fs.writeFileSync(path.join(assetsDir, 'splash.png'), splash);
    fs.writeFileSync(path.join(assetsDir, 'splash-dark.png'), splash);
  }

  console.log('Base assets generated successfully in /assets folder.');
}

createAssets().catch(err => {
  console.error('Error creating assets:', err);
  process.exit(1);
});
