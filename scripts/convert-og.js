const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function convertSvgToPng(svgPath, pngPath, width = 1200, height = 630) {
  try {
    await sharp(svgPath)
      .resize(width, height)
      .png()
      .toFile(pngPath);
    console.log(`✓ Converted: ${svgPath} → ${pngPath}`);
  } catch (err) {
    console.error(`✗ Error converting ${svgPath}:`, err.message);
  }
}

async function main() {
  const publicDir = path.join(__dirname, '..', 'public');
  
  // Convert photophon OG image
  const photophonSvg = path.join(publicDir, 'photophon', 'og-image.svg');
  const photophonPng = path.join(publicDir, 'photophon', 'og-image.png');
  if (fs.existsSync(photophonSvg)) {
    await convertSvgToPng(photophonSvg, photophonPng);
  }
  
  // Convert ans OG image
  const ansSvg = path.join(publicDir, 'ans', 'og-image.svg');
  const ansPng = path.join(publicDir, 'ans', 'og-image.png');
  if (fs.existsSync(ansSvg)) {
    await convertSvgToPng(ansSvg, ansPng);
  }
  
  console.log('Done!');
}

main();
