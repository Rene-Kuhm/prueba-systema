const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [192, 512];
const source = path.join(__dirname, 'icon.png'); // Your source icon

async function generateIcons() {
  for (const size of sizes) {
    await sharp(source)
      .resize(size, size)
      .toFile(path.join(__dirname, `icon-${size}x${size}.png`));
  }
}

generateIcons().catch(console.error);
