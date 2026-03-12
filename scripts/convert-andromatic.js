const sharp = require('sharp');
const path = require('path');

async function main() {
  const publicDir = path.join(__dirname, '..', 'public');
  
  // Convert andromatic OG image
  const andromaticSvg = path.join(publicDir, 'andromatic', 'og-image.svg');
  const andromaticPng = path.join(publicDir, 'andromatic', 'og-image.png');
  
  try {
    await sharp(andromaticSvg)
      .resize(1200, 630)
      .png()
      .toFile(andromaticPng);
    console.log('✓ Converted: andromatic/og-image.svg → andromatic/og-image.png');
  } catch (err) {
    console.error('✗ Error:', err.message);
  }
}

main();
